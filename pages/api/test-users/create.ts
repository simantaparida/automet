import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

/**
 * POST /api/test-users/create
 * Create test login profiles for Owner, Coordinator, and Technician
 *
 * This endpoint uses the service role key to create users in Supabase Auth
 * and corresponding entries in the public.users table.
 *
 * ⚠️ This should only be used in development/testing environments!
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Test user creation is not allowed in production',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({
      error: 'Server configuration error',
      message:
        'Supabase Admin client not available. Check SUPABASE_SERVICE_ROLE_KEY in environment variables.',
    });
  }

  try {
    // Test credentials
    const testUsers = [
      {
        email: 'owner@automet.test',
        password: 'TestOwner123!',
        role: 'owner' as const,
        name: 'Test Owner',
      },
      {
        email: 'coordinator@automet.test',
        password: 'TestCoordinator123!',
        role: 'coordinator' as const,
        name: 'Test Coordinator',
      },
      {
        email: 'technician@automet.test',
        password: 'TestTechnician123!',
        role: 'technician' as const,
        name: 'Test Technician',
      },
    ];

    // First, ensure we have a test organization
    let orgId: string;
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', 'test-org')
      .maybeSingle();

    if (existingOrg) {
      orgId = existingOrg.id;
    } else {
      // Create test organization
      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: 'Test Organization',
          slug: 'test-org',
          settings: {},
        })
        .select()
        .single();

      if (orgError || !newOrg) {
        throw new Error(
          `Failed to create organization: ${orgError?.message || 'Unknown error'}`
        );
      }

      orgId = newOrg.id;
    }

    const results = [];

    // Create each test user
    for (const userData of testUsers) {
      try {
        // Step 1: Create user in Supabase Auth using Admin API
        // Try using the Supabase Admin client method first
        let authUserId: string | null = null;
        let authError: Error | null = null;

        try {
          // Use the admin client's auth.admin.createUser method
          const { data: authUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true, // Auto-confirm email for testing
              user_metadata: {
                full_name: userData.name,
              },
            });

          if (createError || !authUser?.user) {
            authError = new Error(
              createError?.message || 'Failed to create auth user'
            );
          } else {
            authUserId = authUser.user.id;
          }
        } catch (err) {
          // Fallback to REST API if client method doesn't work
          try {
            const supabaseUrl =
              process.env.NEXT_PUBLIC_SUPABASE_URL ||
              process.env.SUPABASE_URL ||
              '';
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

            const createUserResponse = await fetch(
              `${supabaseUrl}/auth/v1/admin/users`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${serviceRoleKey}`,
                  apikey: serviceRoleKey,
                },
                body: JSON.stringify({
                  email: userData.email,
                  password: userData.password,
                  email_confirm: true,
                  user_metadata: {
                    full_name: userData.name,
                  },
                }),
              }
            );

            if (!createUserResponse.ok) {
              const errorData = await createUserResponse.json();
              authError = new Error(
                errorData.error?.message ||
                errorData.message ||
                'Failed to create auth user'
              );
            } else {
              const authUserData = await createUserResponse.json();
              if (authUserData?.id) {
                authUserId = authUserData.id;
              } else {
                authError = new Error('Invalid response from auth API');
              }
            }
          } catch (fetchErr) { // Changed from fetchErr: any
            authError = new Error(
              (fetchErr instanceof Error ? fetchErr.message : String(fetchErr)) || 'Failed to create auth user via REST API'
            );
          }
        }

        if (authError || !authUserId) {
          results.push({
            email: userData.email,
            role: userData.role,
            status: 'error',
            error: authError?.message || 'Failed to create auth user',
          });
          continue;
        }

        // Step 2: Create/update user in public.users table
        const { error: dbError } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              id: authUserId,
              email: userData.email,
              email_confirmed: true,
              full_name: userData.name, // Required field: full_name
              org_id: orgId,
              role: userData.role,
            },
            {
              onConflict: 'id',
            }
          )
          .select()
          .single();

        if (dbError) {
          // If database insert fails, try to delete the auth user
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
          } catch (deleteErr) {
            // Try REST API fallback
            try {
              await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''}/auth/v1/admin/users/${authUserId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
                    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                  },
                }
              );
            } catch (err) { // Changed from err: any
              // Ignore delete errors
            }
          }
          results.push({
            email: userData.email,
            role: userData.role,
            status: 'error',
            error: dbError.message,
          });
          continue;
        }

        results.push({
          email: userData.email,
          role: userData.role,
          password: userData.password,
          status: 'success',
          userId: authUserId,
        });
      } catch (error) { // Changed from error: any
        results.push({
          email: userData.email,
          role: userData.role,
          status: 'error',
          error: (error instanceof Error ? error.message : String(error)) || 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return res.status(200).json({
      success: true,
      message: `Created ${successCount} test user(s). ${errorCount} error(s).`,
      organizationId: orgId,
      users: results,
    });
  } catch (error) { // Changed from error: any
    console.error('Error creating test users:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: (error instanceof Error ? error.message : String(error)) || 'Failed to create test users',
    });
  }
}
