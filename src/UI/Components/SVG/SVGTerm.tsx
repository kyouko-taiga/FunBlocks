import React from 'react'

import Color from 'FunBlocks/UI/Utils/Color'

class SVGTerm extends React.PureComponent {

  render() {
    return (
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width={ 300 } height={ 300 }>
        <g>
          <rect
            x={ 0 }
            width={ 100 }
            height={ 32 }
            rx={ 16 }
            style={ this.style(Color.rgb(165,209,255)) }
          />
          <text x={ 12 } y={ 22 } fontSize={ 16 } fontFamily="Verdana">dist</text>
        </g>
        <g transform="translate(48 0)">
          <rect
            x={ 0 }
            width={ 100 }
            height={ 32 }
            rx={ 16 }
            style={ this.style(Color.rgb(255,211,165)) }
          />
          <text x={ 12 } y={ 22 } fontSize={ 16 } fontFamily="Verdana">dist</text>
        </g>
      </svg>
    )
  }

  style(color: Color): Dictionary {
    return {
      fill: color.css,
      stroke: color.shade.css,
      strokeWidth: 4,
    }
  }

}

export default SVGTerm
