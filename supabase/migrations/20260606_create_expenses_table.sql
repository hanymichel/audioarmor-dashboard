create table expenses (
    id bigint generated always as identity primary key,

    expense_date date not null,

    category text not null,

    description text,

    amount numeric(12,2) not null,

    payment_method text,

    supplier_id bigint references suppliers(id),

    created_by uuid,

    created_at timestamptz default now()
);
