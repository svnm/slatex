import React, { PropTypes } from 'react'
import Editor from './slatex/Editor'

export default class AddButton extends React.Component {
  constructor(props) {
    super(props)
  }

  editorUpdated() {
    console.log('updated')
  }

  render() {
    let htmlValue = '<div><p>xxx</p></div>'
    return (
      <div>
        <Editor html={htmlValue} name='body' onChange={::this.editorUpdated} />
      </div>
    )
  }
}
