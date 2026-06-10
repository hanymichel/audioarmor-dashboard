alter table public.stock_movements
  add column if not exists from_warehouse_id bigint,
  add column if not exists to_warehouse_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stock_movements_from_warehouse_id_fkey'
  ) then
    alter table public.stock_movements
      add constraint stock_movements_from_warehouse_id_fkey
      foreign key (from_warehouse_id) references public.warehouses(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'stock_movements_to_warehouse_id_fkey'
  ) then
    alter table public.stock_movements
      add constraint stock_movements_to_warehouse_id_fkey
      foreign key (to_warehouse_id) references public.warehouses(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'inventory_product_id_warehouse_id_key'
  ) then
    alter table public.inventory
      add constraint inventory_product_id_warehouse_id_key
      unique (product_id, warehouse_id);
  end if;
end $$;

create index if not exists stock_movements_from_warehouse_id_idx
  on public.stock_movements using btree (from_warehouse_id);

create index if not exists stock_movements_to_warehouse_id_idx
  on public.stock_movements using btree (to_warehouse_id);
