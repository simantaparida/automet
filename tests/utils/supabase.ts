export interface SupabaseQueryBuilder {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
  range: jest.Mock;
}

export interface SupabaseAdminMock {
  from: jest.Mock;
}

export interface SupabaseAdminHelper {
  supabase: SupabaseAdminMock;
  fromMock: jest.Mock;
  getBuilder: (table: string) => SupabaseQueryBuilder;
  reset: () => void;
}

const resetBuilder = (builder: SupabaseQueryBuilder) => {
  builder.select.mockReset();
  builder.insert.mockReset();
  builder.update.mockReset();
  builder.delete.mockReset();
  builder.eq.mockReset();
  builder.order.mockReset();
  builder.maybeSingle.mockReset();
  builder.single.mockReset();
  builder.range.mockReset();

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);
  builder.order.mockImplementation(() =>
    Promise.resolve({ data: [], error: null })
  );
  builder.maybeSingle.mockResolvedValue({ data: null, error: null });
  builder.single.mockResolvedValue({ data: null, error: null });
};

const createSupabaseQueryBuilder = (): SupabaseQueryBuilder => {
  const builder: SupabaseQueryBuilder = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
    range: jest.fn(),
  };

  resetBuilder(builder);

  return builder;
};

/**
 * Sets up a reusable Supabase admin mock that returns deterministic
 * query builder stubs per table. Tests can access each builder via
 * `getBuilder(table)` and customize return values as needed.
 */
export const setupSupabaseAdminMock = (
  getSupabaseAdmin: jest.Mock
): SupabaseAdminHelper => {
  const builders: Record<string, SupabaseQueryBuilder> = {};

  const getBuilder = (table: string): SupabaseQueryBuilder => {
    if (!builders[table]) {
      builders[table] = createSupabaseQueryBuilder();
    }
    return builders[table];
  };

  const fromMock = jest.fn((table: string) => getBuilder(table));

  const supabase: SupabaseAdminMock = {
    from: fromMock,
  };

  getSupabaseAdmin.mockReturnValue(supabase);

  const reset = () => {
    fromMock.mockReset();
    fromMock.mockImplementation((table: string) => getBuilder(table));
    Object.values(builders).forEach((builder) => resetBuilder(builder));
  };

  return { supabase, fromMock, getBuilder, reset };
};
