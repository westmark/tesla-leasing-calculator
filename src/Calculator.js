/* eslint no-mixed-operators: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { css, StyleSheet } from 'aphrodite';

import Input from './Input';
import Calculation from './Calculation';
import { parsePercentage, parseNumber } from './utils';

let styles;

const vat = 0.25;
const arb = 0.3195;

class Calculator extends Component {
  static propTypes = {
    csvTax: PropTypes.arrayOf( PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ) ) )
      .isRequired,
  };

  static defaultProps = {};

  constructor( props ) {
    super( props );

    const query = qs.parse( window.location.hash ) || {};
    this.state = {
      newCarPrice: '',
      newCarVAT: '',
      newCarOverhead: '',
      taxBenefitValue: '',
      residualValue: '',
      initialMortagePercentage: '',
      newCarPriceSansVAT: '',
      adjustedSalary: '',
      baseSalary: '',
      eCarSubsidy: '40000',
      configuration: 'Ny konfiguration',
      ...query,
    };
  }

  componentWillMount() {
    this.updateCalc();
  }

  getInputs = () => ( {
    newCarPrice: parseNumber( this.state.newCarPrice ),
    newCarVAT: parseNumber( this.state.newCarVAT ),
    newCarOverhead: parseNumber( this.state.newCarOverhead ),
    taxBenefitValue: parseNumber( this.state.taxBenefitValue ),
    residualValue: parseNumber( this.state.residualValue ),
    baseSalary: parseNumber( this.state.baseSalary ),
    adjustedSalary: parseNumber( this.state.adjustedSalary ),
    initialMortagePercentage: parsePercentage( this.state.initialMortagePercentage ),
    interest: parsePercentage( this.state.interest ),
    eCarSubsidy: parseNumber( this.state.eCarSubsidy ),
    taxationIndex: this.state.taxationIndex,
  } );

  updateValue = ( keyValue ) => {
    const query = qs.parse( window.location.hash ) || {};
    const newQuery = { ...query, ...keyValue };
    window.location.hash = qs.stringify( newQuery );
    this.setState( keyValue, this.updateCalc );
  };

  findTax = ( amount ) => {
    const table = this.props.csvTax.filter( ( row ) => row[ 2 ] === this.state.taxationIndex );
    const taxRow = table.find( ( row ) => row[ 3 ] <= amount && row[ 4 ] >= amount );
    return taxRow ? parseInt( taxRow[ 5 ], 10 ) : NaN;
  };

  updateCalc = () => {
    const {
      newCarPrice,
      newCarVAT,
      newCarOverhead,
      baseSalary,
      adjustedSalary,
      taxBenefitValue,
      residualValue,
      initialMortagePercentage,
      interest,
      eCarSubsidy,
    } = this.getInputs();
    const state = {};

    state.newCarPriceSansVAT = newCarPrice - newCarVAT;
    state.totalLeasingCost = state.newCarPriceSansVAT - residualValue;
    state.initialLeasingMortage = state.newCarPriceSansVAT * initialMortagePercentage;
    state.residualLeasingCost = state.totalLeasingCost - state.initialLeasingMortage;

    const pir = interest / 12;
    const discountFactor = ( ( 1 + pir ) ** 36 - 1 ) / ( pir * ( 1 + pir ) ** 36 );
    state.monthlyMortage = state.residualLeasingCost / discountFactor + newCarOverhead / 36;

    state.costOfInterest = state.monthlyMortage * 36 + state.initialLeasingMortage - state.totalLeasingCost;

    const finalMonthlyLeasingCost = ( state.monthlyMortage * 36 + state.initialLeasingMortage ) / 36;
    state.leasingVAT = vat * finalMonthlyLeasingCost * 0.5;
    state.finalMonthlyLeasingCost = finalMonthlyLeasingCost + state.leasingVAT - eCarSubsidy / 36;

    state.salaryAfterLeasing = adjustedSalary - state.finalMonthlyLeasingCost;

    const montlySalaryWithBenefits = state.salaryAfterLeasing + taxBenefitValue;

    state.totalMonthlyTax = this.findTax( montlySalaryWithBenefits );
    state.netMonthlySalary = state.salaryAfterLeasing - state.totalMonthlyTax;
    state.socialCosts = ( state.salaryAfterLeasing + taxBenefitValue ) * arb;
    state.totalCostForCompany = state.socialCosts + adjustedSalary;

    state.baseTotalMonthlyTax = this.findTax( baseSalary );
    state.baseNetMonthlySalary = baseSalary - state.baseTotalMonthlyTax;
    state.baseSocialCosts = baseSalary * arb;
    state.baseTotalCostForCompany = state.baseSocialCosts + baseSalary;

    state.totalCostForCompanyDifference =
      state.totalCostForCompany - state.baseTotalCostForCompany + state.leasingVAT;

    state.irsTake = state.socialCosts + state.totalMonthlyTax;

    this.setState( state );
  };

  render() {
    return (
      <div className={ css( styles.container ) }>
        <div className={ css( styles.header ) }>
          <Input
            id="name"
            emph
            text
            label="Konfiguration"
            value={ this.state.configuration }
            onChange={ ( configuration ) => this.updateValue( { configuration } ) }
          />
        </div>
        <div className={ css( styles.columns ) }>
          <div className={ css( styles.column, styles.left ) }>
            <div className={ css( styles.columnInner ) }>
              <h2 className={ css( styles.h2 ) }>Variabler</h2>
              <Input
                id="newCarPrice"
                label="Nybilspris, ink moms"
                value={ this.state.newCarPrice }
                onChange={ ( newCarPrice ) => this.updateValue( { newCarPrice } ) }
              />
              <Input
                id="newCarVAT"
                label="Nybilspris moms"
                value={ this.state.newCarVAT }
                onChange={ ( newCarVAT ) => this.updateValue( { newCarVAT } ) }
              />
              <Input
                id="residualValue"
                label="Restvärde"
                value={ this.state.residualValue }
                onChange={ ( residualValue ) => this.updateValue( { residualValue } ) }
              />
              <Input
                id="newCarOverhead"
                label="Overheadkostnader"
                value={ this.state.newCarOverhead }
                onChange={ ( newCarOverhead ) => this.updateValue( { newCarOverhead } ) }
              />
              <Input
                id="initialMortagePercentage"
                label="Första förhöjda hyra (FHH)"
                value={ this.state.initialMortagePercentage }
                noPadding
                percentage
                onChange={ ( initialMortagePercentage ) => this.updateValue( { initialMortagePercentage } ) }
              />
              <Input
                id="interest"
                label="Ränta"
                noPadding
                percentage
                value={ this.state.interest }
                onChange={ ( interest ) => this.updateValue( { interest } ) }
              />
              <Input
                id="eCarSubsidy"
                label="Supermiljöbilpremie"
                value={ this.state.eCarSubsidy }
                onChange={ ( eCarSubsidy ) => this.updateValue( { eCarSubsidy } ) }
              />
              <Input
                id="taxBenefitValue"
                label="Förmånsvärde"
                value={ this.state.taxBenefitValue }
                onChange={ ( taxBenefitValue ) => this.updateValue( { taxBenefitValue } ) }
              />
              <Input
                id="baseSalary"
                label="Baslön"
                value={ this.state.baseSalary }
                onChange={ ( baseSalary ) => this.updateValue( { baseSalary } ) }
              />
              <Input
                id="adjustedSalary"
                label="Justerad lön"
                value={ this.state.adjustedSalary }
                emph
                onChange={ ( adjustedSalary ) => this.updateValue( { adjustedSalary } ) }
              />
              <Input
                id="taxationIndex"
                label="Skattetabell"
                value={ this.state.taxationIndex }
                onBlur={ ( taxationIndex ) => this.updateValue( { taxationIndex } ) }
              />
            </div>
          </div>
          <div className={ css( styles.column, styles.left ) }>
            <div className={ css( styles.columnInner ) }>
              <h2 className={ css( styles.h2 ) }>Leasing</h2>
              <Calculation label="Nybilspris, ex moms" value={ this.state.newCarPriceSansVAT } />
              <Calculation label="Leasingkostnad, ex moms" value={ this.state.totalLeasingCost } />
              <Calculation label="FHH, ex moms" value={ this.state.initialLeasingMortage } />
              <Calculation
                label="Kvarvarande leasingkostnad, ex moms"
                value={ this.state.residualLeasingCost }
              />
              <Calculation label="Månadskostnad leasing, ex moms" value={ this.state.monthlyMortage } />
              <Calculation label="Total räntekostnad leasing, ex moms" value={ this.state.costOfInterest } />
              <Calculation label="Ej avdragsgill moms" value={ this.state.leasingVAT } />
              <Calculation
                label="Äkta månadskostnad leasing, ink. 1/2 moms, ink. s-premie"
                value={ this.state.finalMonthlyLeasingCost }
              />
            </div>
          </div>
          <div className={ css( styles.column, styles.left ) }>
            <div className={ css( styles.columnInner ) }>
              <h2 className={ css( styles.h2 ) }>Basutslag</h2>
              <Calculation label="Bruttolön, bas" value={ this.state.baseSalary } />
              <Calculation label="Total skatt, bas" value={ this.state.baseTotalMonthlyTax } />
              <Calculation emph label="Nettolön, bas" value={ this.state.baseNetMonthlySalary } />
              <Calculation label="Sociala kostnader, bas" value={ this.state.baseSocialCosts } />
              <Calculation emph label="Total kostnad bolag, bas" value={ this.state.baseTotalCostForCompany } />

              <h2 className={ css( styles.h2 ) }>Justerat utslag</h2>
              <Calculation label="Bruttolön efter leasing" value={ this.state.salaryAfterLeasing } />
              <Calculation label="Total skatt (ink förmånsskatt)" value={ this.state.totalMonthlyTax } />
              <Calculation emph label="Nettolön" value={ this.state.netMonthlySalary } />
              <Calculation label="Sociala kostnader" value={ this.state.socialCosts } />
              <Calculation emph label="Total kostnad bolag" value={ this.state.totalCostForCompany } />

              <h2 className={ css( styles.h2 ) }>Resultat</h2>
              <Calculation
                emph
                label="Total kostnad bolag - differens"
                value={ this.state.totalCostForCompanyDifference }
              />
              <Calculation label="Skatteverket erhåller" value={ this.state.irsTake } />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

styles = StyleSheet.create( {
  container: {
    maxWidth: '100rem',
    margin: '2rem auto',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.3)',
  },

  header: {
    padding: '1.6rem 1.6rem 0 1.6rem',
  },

  columns: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  column: {
    flex: '1 0 25rem',
  },

  columnInner: {
    padding: '0 3.4rem 1.6rem 1.6rem',
  },

  h2: {
    fontSize: '1.8rem',
    marginTop: '2rem',
  },
} );

export default Calculator;
