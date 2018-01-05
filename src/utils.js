export const parsePercentage = ( value = '' ) => {
  const m = value.match( /([^%]+)%?/ );
  return parseFloat( ( m && m[ 1 ].replace( ',', '.' ) ) || 0 ) / 100;
};

export const parseNumber = ( value = '' ) => {
  const m = value.match( /\./ );
  if ( m ) {
    return parseFloat( value, 10 ) || 0;
  }
  return parseInt( value, 10 ) || 0;
};
