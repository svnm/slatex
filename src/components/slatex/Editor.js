const rules = [
  {
    deserialize(el, next) {
      if (el.tagName == 'p') {
        return {
          kind: 'block',
          type: 'paragraph',
          nodes: next(el.children)
        }
      }
    },
    // Add a serializing function property to our rule...
    serialize(object, children) {
      if (object.kind == 'block' && object.type == 'paragraph') {
        return <p>{children}</p>
      }
    }
  }
]

let initialState = {
  "nodes": [
    {
      "kind": "block",
      "type": "paragraph",
      "nodes": [
        {
          "kind": "text",
          "ranges": [
            {
              "text": "The editor gives you full control over the logic you can add. For example, it's fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with \"> \" you get a blockquote that looks like this:"
            }
          ]
        }
      ]
    },
    {
      "kind": "block",
      "type": "block-quote",
      "nodes": [
        {
          "kind": "text",
          "ranges": [
            {
              "text": "A wise quote."
            }
          ]
        }
      ]
    },
    {
      "kind": "block",
      "type": "paragraph",
      "nodes": [
        {
          "kind": "text",
          "ranges": [
            {
              "text": "Order when you start a line with \"## \" you get a level-two heading, like this:"
            }
          ]
        }
      ]
    },
    {
      "kind": "block",
      "type": "heading-two",
      "nodes": [
        {
          "kind": "text",
          "ranges": [
            {
              "text": "Try it out!"
            }
          ]
        }
      ]
    },
    {
      "kind": "block",
      "type": "paragraph",
      "nodes": [
        {
          "kind": "text",
          "ranges": [
            {
              "text": "Try it out for yourself! Try starting a new line with \">\", \"-\", or \"#\"s."
            }
          ]
        }
      ]
    }
  ]
}

import { Editor, Raw } from 'slate'
import React from 'react'
import isImage from 'is-image'
import isUrl from 'is-url'
import { Html } from 'slate'

const html = new Html({ rules })

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
  nodes: {
    image: (props) => {
      const { node, state } = props
      const isFocused = state.selection.hasEdgeIn(node)
      const src = node.data.get('src')
      const className = isFocused ? 'active' : null
      return (
        <img src={src} className={className} {...props.attributes} />
      )
    }
  }
}

/**
 * The images example.
 *
 * @type {Component}
 */

class Images extends React.Component {

  state = {
    state: html.deserialize(this.props.html),
    // Add a schema with our nodes and marks...
    schema: {
      nodes: {
        code: props => <pre {...props.attributes}>{props.children}</pre>,
        paragraph: props => <p {...props.attributes}>{props.children}</p>,
        quote: props => <blockquote {...props.attributes}>{props.children}</blockquote>,
      },
      marks: {
        bold: props => <strong>{props.children}</strong>,
        italic: props => <em>{props.children}</em>,
        underline: props => <u>{props.children}</u>,
      }
    }
  }


  render = () => {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    )
  }

  renderToolbar = () => {
    return (
      <div className="menu toolbar-menu">
        <span className="button" onMouseDown={this.onClickImage}>
          <span className="material-icons">image</span>
        </span>
      </div>
    )
  }


  renderEditor = () => {
    return (
      <div className="editor">
        <Editor
          schema={schema}
          state={this.state.state}
          onChange={this.onChange}
          onDocumentChange={this.onDocumentChange}
          onDrop={this.onDrop}
          onPaste={this.onPaste}
        />
      </div>
    )
  }


  onChange = (state) => {
    this.setState({ state })
  }


  onDocumentChange = (document, state) => {
    const blocks = document.getBlocks()
    const last = blocks.last()
    if (last.type != 'image') return

    const normalized = state
      .transform()
      .collapseToEndOf(last)
      .splitBlock()
      .setBlock({
        type: 'paragraph',
        isVoid: false,
        data: {}
      })
      .apply({
        save: false
      })

    this.onChange(normalized)
  }


  onClickImage = (e) => {
    e.preventDefault()
    const src = window.prompt('Enter the URL of the image:')
    if (!src) return
    let { state } = this.state
    state = this.insertImage(state, src)
    this.onChange(state)
  }

  onDrop = (e, data, state, editor) => {
    switch (data.type) {
      case 'files': return this.onDropOrPasteFiles(e, data, state, editor)
      case 'node': return this.onDropNode(e, data, state)
    }
  }

  onDropNode = (e, data, state) => {
    return state
      .transform()
      .unsetSelection()
      .removeNodeByKey(data.node.key)
      .moveTo(data.target)
      .insertBlock(data.node)
      .apply()
  }

  onDropOrPasteFiles = (e, data, state, editor) => {
    for (const file of data.files) {
      const reader = new FileReader()
      const [ type ] = file.type.split('/')
      if (type != 'image') continue

      reader.addEventListener('load', () => {
        state = editor.getState()
        state = this.insertImage(state, reader.result)
        editor.onChange(state)
      })

      reader.readAsDataURL(file)
    }
  }

  onPaste = (e, data, state, editor) => {
    switch (data.type) {
      case 'files': return this.onDropOrPasteFiles(e, data, state, editor)
      case 'text': return this.onPasteText(e, data, state)
    }
  }

  onPasteText = (e, data, state) => {
    if (!isUrl(data.text)) return
    if (!isImage(data.text)) return
    return this.insertImage(state, data.text)
  }

  insertImage = (state, src) => {
    return state
      .transform()
      .insertBlock({
        type: 'image',
        isVoid: true,
        data: { src }
      })
      .apply()
  }

}

/**
 * Export.
 */

export default Images
