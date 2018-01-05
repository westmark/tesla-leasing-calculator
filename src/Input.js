import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import thousands from 'thousands';

import { parsePercentage, parseNumber } from './utils';

let styles;

const pad = ( value ) => thousands( value, ' ' );

class Input extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    label: PropTypes.string,
    percentage: PropTypes.bool,
    text: PropTypes.bool,
    noPadding: PropTypes.bool,
    emph: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    label: '',
    percentage: false,
    noPadding: false,
    emph: false,
    text: false,
    onChange: null,
    onBlur: null,
  };

  state = {
    tempValue: null,
  };

  convertValue = ( value ) => {
    if ( this.props.text ) {
      return value;
    }
    return value.replace( /\s/g, '' );
  }

  handleFocus = () => this.setState( { focus: true } );
  handleBlur = ( event ) => {
    this.setState( { focus: false, tempValue: null } );
    if ( this.props.onBlur ) {
      this.props.onBlur( this.convertValue( event.target.value ) );
    }
  };
  handleChange = ( event ) => {
    if ( this.props.onChange ) {
      this.props.onChange( this.convertValue( event.target.value ) );
    } else {
      this.setState( { tempValue: event.target.value } );
    }
  }

  handleKeyDown = ( event ) => {
    let newValue = null;
    if ( event.keyCode === 38 ) {
      if ( this.props.percentage ) {
        newValue = parseNumber( this.props.value );
        newValue += 0.1;
        newValue = Math.round( newValue * 100 ) / 100;
      } else {
        newValue = parseNumber( this.props.value );
        newValue += 100;
      }
    } else if ( event.keyCode === 40 ) {
      if ( this.props.percentage ) {
        newValue = parseNumber( this.props.value );
        newValue -= 0.1;
        newValue = Math.round( newValue * 100 ) / 100;
      } else {
        newValue = parseNumber( this.props.value );
        newValue -= 100;
      }
    }
    if ( newValue !== null && this.props.onChange ) {
      this.props.onChange( newValue.toString() );
    }
  };

  render() {
    const { id, value, label, percentage, noPadding } = this.props;
    const actualValue = this.state.tempValue || value;
    const paddedValue = noPadding || this.state.focus ? actualValue : pad( actualValue );

    return (
      <div className={ css( styles.container ) }>
        <label htmlFor={ id } className={ css( styles.label ) }>
          { label }
        </label>
        <div className={ css( styles.inputContainer ) }>
          <input
            id={ id }
            className={ css(
              styles.input,
              percentage && styles.percentageInput,
              this.props.emph && styles.emph,
            ) }
            value={ paddedValue }
            onFocus={ this.handleFocus }
            onChange={ this.handleChange }
            onBlur={ this.handleBlur }
            onKeyDown={ this.handleKeyDown }
          />
          { percentage ? <div className={ css( styles.percentage ) }>%</div> : null }
        </div>
      </div>
    );
  }
}

styles = StyleSheet.create( {
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 0 1.6rem 0',
  },

  label: {
    fontSize: '1.2rem',
    color: '#666',
    margin: '0 0 0.5rem',
  },

  inputContainer: {
    display: 'flex',
    position: 'relative',
  },

  input: {
    flex: '1 0 auto',
    color: '#333',
    padding: '0.9rem',
    outline: 0,
    border: '2px solid #ccc',
    borderRadius: 4,
    fontSize: '1.4rem',

    ':focus': {
      borderColor: 'rgb(71, 175, 115)',
    },
  },

  emph: {
    borderColor: '#444',
  },

  percentageInput: {
    paddingRight: '4rem',
  },

  percentage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    margin: '0.3rem',
    borderRadius: '0 4px 4px 0',
    fontSize: '1.6rem',
    fontWeight: 600,
    backgroundColor: '#bbb',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
  },
} );

export default Input;
