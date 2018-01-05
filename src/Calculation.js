import React from 'react';
import PropTypes from 'prop-types';
import { css, StyleSheet } from 'aphrodite';
import thousands from 'thousands';

const pad = ( value ) => thousands( value, ' ' );

let styles;

const Calculation = ( { value, label, emph } ) => (
  <div className={ css( styles.container ) }>
    <div className={ css( styles.label ) }>
      { label }
    </div>
    <div className={ css( styles.value, emph && styles.emph ) }>
      { pad( Math.round( value * 100 ) / 100 ) }
    </div>
  </div>
);

Calculation.propTypes = {
  value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
  label: PropTypes.string,
  emph: PropTypes.bool,
};

Calculation.defaultProps = {
  value: '',
  label: '',
  emph: false,
};

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

  value: {
    border: '2px solid #ddd',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    fontSize: '1.4rem',
    color: '#333',
    padding: '0.9rem',
    outline: 0,
    width: '100%',
    minHeight: '3.8rem',
  },

  emph: {
    fontWeight: 600,
    borderColor: '#555',
  },
} );

export default Calculation;
