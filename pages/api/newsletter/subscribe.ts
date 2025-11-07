/**
 * Newsletter Subscription API
 * Handles email signups for blog newsletter
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

interface NewsletterSubscription {
  email: string;
  source: string;
  variant: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, source, variant }: NewsletterSubscription = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if email already exists
    const { data: existing } = await supabaseServer
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return res.status(200).json({ 
          success: true, 
          message: 'You are already subscribed!' 
        });
      } else if (existing.status === 'unsubscribed') {
        // Reactivate subscription
        const { error: updateError } = await supabaseServer
          .from('newsletter_subscribers')
          .update({ 
            status: 'pending',
            subscribed_at: new Date().toISOString(),
            source,
            variant 
          })
          .eq('email', email.toLowerCase());

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to reactivate subscription' 
          });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Welcome back! Check your email to confirm subscription.' 
        });
      }
    }

    // Create new subscription
    const { error: insertError } = await supabaseServer
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        source: source || 'blog',
        variant: variant || 'inline',
        status: 'pending', // Will be 'active' after email confirmation
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to subscribe. Please try again.' 
      });
    }

    // TODO: Send confirmation email
    // For now, we'll just mark as active
    // In production, you'd send an email with a confirmation link
    await supabaseServer
      .from('newsletter_subscribers')
      .update({ status: 'active' })
      .eq('email', email.toLowerCase());

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully subscribed! Welcome to our newsletter.' 
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again.' 
    });
  }
}

