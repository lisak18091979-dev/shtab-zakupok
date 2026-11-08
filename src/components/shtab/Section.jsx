export default function Section({ kicker, title, note, right, children }) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">{kicker}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">{title}</h2>
          {note && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{note}</p>}
        </div>
        {right}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}