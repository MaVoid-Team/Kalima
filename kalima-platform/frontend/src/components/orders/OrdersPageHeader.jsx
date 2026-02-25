/* eslint-disable react/prop-types */
export default function OrdersPageHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}
