
interface AccordionProps {
  children: any,
  header: any,
  initiallyOpen?: boolean,
  containerClassName?: string
}


export default function Accordion({ children, header, initiallyOpen, containerClassName }: AccordionProps): JSX.Element {
  return (
    <details
      className={`group px-8 pt-6 pb-5 md:pl-11 bg-[#FAF9F4] md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden ${containerClassName}`}
      open={initiallyOpen || false}
    >
      <summary className="block cursor-pointer marker:hidden">{header}</summary>
      {children}
    </details>
  );
}