/* eslint no-mixed-operators: 0 */
import React, { Component } from 'react';

import Calculator from './Calculator';

class App extends Component {
  static propTypes = {};

  static defaultProps = {};

  state = {};

  componentWillMount() {
    fetch( 'https://skatteverket.entryscape.net/store/9/resource/94' )
      .then( ( response ) => response.text() )
      .then( ( csv ) => {
        let csvTax = csv.split( /[\r\n]/g ).map( ( line ) => line.split( ';' ) );
        csvTax.splice( 0, 2 );
        csvTax = csvTax.map( ( line ) => {
          line[ 3 ] = parseInt( line[ 3 ], 10 ); // eslint-disable-line
          line[ 4 ] = parseInt( line[ 4 ], 10 ); // eslint-disable-line
          return line;
        } );
        this.setState( { csvTax } );
      } );
  }

  render() {
    if ( !this.state.csvTax ) {
      return null;
    }

    return <Calculator csvTax={ this.state.csvTax } />;
  }
}

export default App;
