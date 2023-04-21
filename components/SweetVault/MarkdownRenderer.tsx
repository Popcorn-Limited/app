import MarkedReact from "marked-react"

function MarkdownRenderer({ content = "" }) {
  return (
    <MarkedReact
      renderer={{
        link(href, text) {
          return (
            <a
              className="text-customPurple underline"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {text}
            </a>
          )
        },
        hr() {
          return <hr className="my-3 opacity-50" />
        },
        heading(children) {
          return <h3 className="font-medium text-lg mb-1">{children}</h3>
        },
      }}
      value={content}
      breaks
      gfm
    />
  )
}

export default MarkdownRenderer
