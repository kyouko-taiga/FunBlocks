import "ace-builds/src-noconflict/mode-text"

const ace = window.ace

const TextHighlightRules = ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules
const TextMode = ace.acequire("ace/mode/text").Mode

export class FBHighlightRules extends TextHighlightRules {

  constructor() {
    super()

    const keywordMapper = this.createKeywordMapper({
      keyword: 'type init rule case',
    }, 'text', true, ' ')

    this.$rules = {
      start: [
        { token: 'comment', regex: '//.*$' },
        { token: 'constant.numeric', regex: '[+-]?\d+\b'},
        { token: 'keyword.operator', regex: /->|=>/ },
        { token: 'variable.parameter', regex: /\$\w+\b/ },
        { token: keywordMapper, regex: '\\b\\w+\\b' },
      ]
    }
  }

}

export class FBMode extends TextMode {

  constructor() {
    super()
    this.HighlightRules = FBHighlightRules
  }
}
