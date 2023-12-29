import React, { useState } from 'react';
import './Table.css';
import axios from 'axios';
import Decimal from 'decimal.js';

const Table = ({ setError, isMobile }) => {
    const [showInstructions, setShowInstructions] = useState(false);
    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
    };

    const [status, setStatus] = useState("");
    
    const [ticker, setBaseTicker] = useState("");
    const [ticker_input, setTicker] = useState("");

    // Useless Second Versions but too lazy to get rid of them 
    const [FY1_input, setFY1] = useState(0);
    const [FY2_input, setFY2] = useState(0);
    const [plowback_rate_input, setPlowbackRate] = useState(0);
    const [risk_premium_input, setRiskPremium] = useState(0);
    const [growth_rate_input, setGrowthRate] = useState(0);

    const [fy0, setFy0] = useState(0);
    const [monthsToFYE, setMonthsToFYE] = useState(0);
    const [fe0, setFe0] = useState(0);
    const [fe1, setFe1] = useState(0);
    const [fe2, setFe2] = useState(0);
    const [eps_growth, setEpsGrowth] = useState(0);
    const [book_value, setBookValue] = useState(0);
    const [stock_price, setStockPrice] = useState(0);
    const [shares, setShares] = useState(0);
    const [debt, setDebt] = useState(0);
    const [cash, setCash] = useState(0);
    const [risk_free_rate, setRiskFreeRate] = useState(0);
    const [beta, setBeta] = useState(0);
    const [adjusted_beta, setAdjustedBeta] = useState(0);
    const [cost_of_equity, setCostOfEquity] = useState(0);
    const [implied_cost_of_equity, setImpliedCostOfEquity] = useState(0);
    const [intrinsic_value_of_equity_per_share_dfc, setIntrinsicValue] = useState(0);
    const [profit_volume_ratio, setProfitVolumeRatio] = useState(0);
    const [assets_in_place_value, setAssetsInPlace] = useState(0);
    const [pvgo, setPVGO] = useState(0);
    const [value_of_equity, setValueOfEquity] = useState(0);
    const [total_firm_value, setFirmValue] = useState(0);
    const [total_enterprise_value, setEnterpriseValue] = useState(0);

    const [shares_unit, setSharesUnit] = useState("");
    const [debt_unit, setDebtUnit] = useState("");
    const [cash_unit, setCashUnit] = useState("");
    const [value_of_equity_unit, setValueOfEquityUnit] = useState("");
    const [firm_value_unit, setFirmValueUnit] = useState("");
    const [enterprise_value_unit, setEnterpriseValueUnit] = useState("");

    const [alt_fy0, setAltFy0] = useState(0);
    const [alt_fy1, setAltFy1] = useState(0);
    const [alt_fy2, setAltFy2] = useState(0);
    const [alt_monthsToFYE, setAltMonthsToFYE] = useState(0);
    const [alt_fe0, setAltFe0] = useState(0);
    const [alt_fe1, setAltFe1] = useState(0);
    const [alt_fe2, setAltFe2] = useState(0);
    const [alt_growth_rate_input, setAltGrowthRate] = useState(0);
    const [alt_plowback_rate, setAltPlowbackRate] = useState(0);
    const [alt_eps_growth, setAltEpsGrowth] = useState(0);
    const [alt_book_value, setAltBookValue] = useState(0);
    const [alt_stock_price, setAltStockPrice] = useState(0);
    const [alt_shares, setAltShares] = useState(0);
    const [alt_debt, setAltDebt] = useState(0);
    const [alt_cash, setAltCash] = useState(0);
    const [alt_risk_free_rate, setAltRiskFreeRate] = useState(0);
    const [alt_beta, setAltBeta] = useState(0);
    const [alt_adjusted_beta, setAltAdjustedBeta] = useState(0);
    const [alt_risk_premium, setAltRiskPremium] = useState(0);
    const [alt_cost_of_equity, setAltCostOfEquity] = useState(0);
    const [alt_implied_cost_of_equity, setAltImpliedCostOfEquity] = useState(0);
    const [alt_intrinsic_value_of_equity_per_share_dfc, setAltIntrinsicValue] = useState(0);
    const [alt_profit_volume_ratio, setAltProfitVolumeRatio] = useState(0);
    const [alt_assets_in_place_value, setAltAssetsInPlace] = useState(0);
    const [alt_pvgo, setAltPVGO] = useState(0);
    const [alt_value_of_equity, setAltValueOfEquity] = useState(0);
    const [alt_total_firm_value, setAltFirmValue] = useState(0);
    const [alt_total_enterprise_value, setAltEnterpriseValue] = useState(0);

    const [alt_shares_unit, setAltSharesUnit] = useState("");
    const [alt_debt_unit, setAltDebtUnit] = useState("");
    const [alt_cash_unit, setAltCashUnit] = useState("");
    const [alt_value_of_equity_unit, setAltValueOfEquityUnit] = useState("");
    const [alt_firm_value_unit, setAltFirmValueUnit] = useState("");
    const [alt_enterprise_value_unit, setAltEnterpriseValueUnit] = useState("");

    const [getting_values, setGettingValues] = useState(false);

    let growth_rate_changed = false;

    let fy1 = 0;
    let fy2 = 0;
    let risk_premium = 5.00;
    let growth_rate = 0;
    let alt_growth_rate = 0;
    let plowback_rate = 0;

    // Discounted Cash Flow Calculations (15 Transition Years)
    let g = [];                                         // Growth in New Income or EPS
    let k = [];                                         // Plowback Rate
    let eps = [];                                       // Earnings Per Share before Extraordinary Items
    let net_new_equity_investments = [];                // Net New Equity Investments
    let fcfe = [];                                      // Free Cash Flow to Equity
    let fcfe_growth = [];                               // Free Cash Flow to Equity Growth
    let book_value_per_share = [];                      // Book Value Per Share
    let roe = [];                                       // Return on Book Equity
    let roi = [];                                       // Return on new equity Investments
    let ri = [];                                        // Residual Income (EVA for Shareholders)
    let roe_less_re = [];                               // ROE - Cost of Equity
    
    // Function to handle user input changes
    const handleInputChange = (e, setter) => {
        const newValue = e.target.value;
        // Use a regular expression to allow only numbers and a single dot
        const regex = /^[0-9]*\.?[0-9]*$/;
    
        if (regex.test(newValue)) {
          setter(newValue);
        }
    };

    const handleTickerChange = (e) => {
        if(e.target.value !== ticker_input) {
            setTicker(e.target.value);
        }
    };

    const handleKeyDown = (event) => {
        if(event.key === 'Enter') {
            run();
        }
    }

    const run = () => {
        if(ticker_input === ticker && getting_values === false && ticker !== "") {
            if(FY1_input <= 0 || FY2_input <= 0) {
                setError("Unable to value firm due to negative values for FY1 or FY2");
                return;
            } else if(plowback_rate_input < 0) {
                setError("Unable to value firm due to negative plowback rate");
                return;
            } else if(plowback_rate_input > 1) {
                setError("Unable to value firm due as plowback rate is > 1");
                return;
            } else if(growth_rate_input < 1) {
                setError("Unable to value firm as Growth Rate Forecast is < 1%");
                return;
            } else if(growth_rate_input > 75) {
                setError("Unable to value firm as Growth Rate Forecast is > 75%");
                return;
            } else if(beta <= 0) {
                setError("Unable to value firm due to negative beta");
                return;
            } else if(risk_premium_input <= 0) {
                setError("Unable to value firm due to negative risk premium");
                return;
            }

            fy1 = FY1_input;
            fy2 = FY2_input;
            plowback_rate = plowback_rate_input;
            risk_premium = risk_premium_input/100;

            if(growth_rate !== growth_rate_input/100) {
                growth_rate_changed = true;
            }
            growth_rate = growth_rate_input/100;

            calculateValues();
        } else {
            setStatus("Retrieving Data...");
            getValues();
        }
    };

    const restore = () => {
        setStatus("Restoring...");
        setTicker(ticker);

        setFY1(alt_fy1);
        setFY2(alt_fy2);
        setGrowthRate(alt_growth_rate_input);
        growth_rate = alt_growth_rate;
        setPlowbackRate(alt_plowback_rate);
        setRiskPremium(alt_risk_premium);
        setFy0(alt_fy0);
        setMonthsToFYE(alt_monthsToFYE);
        setFe0(alt_fe0);
        setFe1(alt_fe1);
        setFe2(alt_fe2);
        setEpsGrowth(alt_eps_growth);
        setBookValue(alt_book_value);
        setStockPrice(alt_stock_price);
        setRiskFreeRate(alt_risk_free_rate);
        setBeta(alt_beta);
        setAdjustedBeta(alt_adjusted_beta);
        setCostOfEquity(alt_cost_of_equity);
        setImpliedCostOfEquity(alt_implied_cost_of_equity);
        setIntrinsicValue(alt_intrinsic_value_of_equity_per_share_dfc);
        setProfitVolumeRatio(alt_profit_volume_ratio);
        setAssetsInPlace(alt_assets_in_place_value);
        setPVGO(alt_pvgo);

        setShares(alt_shares);
        setSharesUnit(alt_shares_unit);
        setDebt(alt_debt);
        setDebtUnit(alt_debt_unit);
        setCash(alt_cash);
        setCashUnit(alt_cash_unit);
        setValueOfEquity(alt_value_of_equity);
        setValueOfEquityUnit(alt_value_of_equity_unit);
        setFirmValue(alt_total_firm_value);
        setFirmValueUnit(alt_firm_value_unit);
        setEnterpriseValue(alt_total_enterprise_value);
        setEnterpriseValueUnit(alt_enterprise_value_unit);

        setStatus("Restored!");
    }

    const calculateValues = () => {
        setStatus("Calculating Values...");
        let shares_decimal = new Decimal(reverseCalculateUnits(shares, shares_unit));
        let debt_decimal = new Decimal(reverseCalculateUnits(debt, debt_unit));
        let cash_decimal = new Decimal(reverseCalculateUnits(cash, cash_unit));

        let adjusted_beta_decimal = new Decimal(1).dividedBy(3).plus(new Decimal(2).dividedBy(3).times(beta));
        let cost_of_equity_decimal = adjusted_beta_decimal.times(risk_premium).plus(risk_free_rate);

        let growth_rate_decimal = new Decimal(growth_rate);
        if(!growth_rate_changed) {
            growth_rate_decimal = new Decimal(fy2).dividedBy(fy1).minus(1);
        }
        
        let monthsToFYE_decimal = new Decimal(monthsToFYE);
        let fe0_decimal = new Decimal(monthsToFYE_decimal).div(12).times(fy0).plus(new Decimal(1).minus(monthsToFYE_decimal.div(12)).times(fy1));
        let fe1_decimal = new Decimal(monthsToFYE_decimal).div(12).times(fy1).plus(new Decimal(1).minus(monthsToFYE_decimal.div(12)).times(fy2));
        let fe2_decimal = new Decimal(fe1_decimal).times(new Decimal(1).plus(growth_rate_decimal));
        
        g[2] = growth_rate_decimal;
        k[0] = new Decimal(plowback_rate);
        k[1] = new Decimal(plowback_rate);
        eps[0] = fe0_decimal;
        eps[1] = fe1_decimal;
        eps[2] = fe2_decimal;
        book_value_per_share[0] = new Decimal(book_value);
        
        let temp = Decimal.exp(new Decimal(1).div(15).times(Decimal.log(new Decimal(eps_growth).div(growth_rate_decimal), Decimal.exp(1))));
        for(let i = 3; i <= 16; i++) { g[i] = new Decimal(g[i-1]).times(temp); }
        for(let i = 2; i <= 16; i++) { k[i] = new Decimal(k[i-1]).minus(new Decimal(plowback_rate).minus((new Decimal(eps_growth).dividedBy(cost_of_equity_decimal))).dividedBy(new Decimal(15))); }
        for(let i = 3; i <= 16; i++) { eps[i] = new Decimal(eps[i-1]).times((g[i].plus(new Decimal(1)))); }
        for(let i = 0; i <= 16; i++) { net_new_equity_investments[i] = new Decimal(k[i]).times(eps[i]); }
        for(let i = 0; i <= 16; i++) { fcfe[i] = new Decimal(eps[i]).minus(net_new_equity_investments[i]); }
        for(let i = 1; i <= 16; i++) { fcfe_growth[i] = new Decimal(fcfe[i]).dividedBy(fcfe[i-1]).minus(new Decimal(1)); }
        for(let i = 1; i <= 16; i++) { book_value_per_share[i] = new Decimal(book_value_per_share[i-1]).plus(eps[i]).minus(fcfe[i]); }
        for(let i = 1; i <= 16; i++) { roe[i] = new Decimal(eps[i]).dividedBy(book_value_per_share[i-1]); }
        for(let i = 1; i <= 16; i++) { roi[i] = new Decimal(eps[i]).minus(eps[i-1]).dividedBy(net_new_equity_investments[i-1]); }
        for(let i = 1; i <= 16; i++) { roe_less_re[i] = new Decimal(roe[i]).minus(cost_of_equity_decimal); }
        for(let i = 1; i <= 16; i++) { ri[i] = new Decimal(roe_less_re[i]).times(book_value_per_share[i-1]); }

        // Discounted Free Cash Flow Valuation
        let fcfe_pv = new Decimal(0);
        for(let i = 1; i <= 16; i++) { fcfe_pv = fcfe_pv.plus(fcfe[i].div(Decimal.pow(new Decimal(1).plus(cost_of_equity_decimal), i))); }
        let continuing_value_cash_flow_based = new Decimal(1)
            .div(Decimal.pow(new Decimal(1).plus(cost_of_equity_decimal), 15))
            .times(fcfe[16].div(cost_of_equity_decimal.minus(new Decimal(eps_growth))));
        let intrinsic_value_decimal = fcfe_pv.plus(continuing_value_cash_flow_based);
        let pv_ratio_decimal = new Decimal(stock_price).div(intrinsic_value_decimal);

        // Value of assets in place & PVGO
        let assets_in_place_decimal = new Decimal(fe1_decimal).dividedBy(cost_of_equity_decimal);
        let pvgo_decimal = intrinsic_value_decimal.minus(assets_in_place_decimal);

        // Firm Valuation
        let value_of_equity_decimal = intrinsic_value_decimal.times(shares_decimal);
        let firm_value_decimal = value_of_equity_decimal.plus(debt_decimal);
        let enterprise_value_decimal = firm_value_decimal.minus(cash_decimal);
        
        let cost_of_equity_implied = new Decimal(0.0001);
        while(true) {
            g[2] = growth_rate_decimal;
            k[0] = plowback_rate;
            k[1] = plowback_rate;
            eps[0] = fe0_decimal;
            eps[1] = fe1_decimal;
            eps[2] = fe2_decimal;
            book_value_per_share[0] = new Decimal(book_value);
            
            g[2] = growth_rate_decimal;
            k[0] = new Decimal(plowback_rate);
            k[1] = new Decimal(plowback_rate);
            eps[0] = fe0_decimal;
            eps[1] = fe1_decimal;
            eps[2] = fe2_decimal;
            book_value_per_share[0] = new Decimal(book_value);
            
            let temp = Decimal.exp(new Decimal(1).div(15).times(Decimal.log(new Decimal(eps_growth).div(growth_rate_decimal), Decimal.exp(1))));
            for(let i = 3; i <= 16; i++) { g[i] = new Decimal(g[i-1]).times(temp); }
            for(let i = 2; i <= 16; i++) { k[i] = new Decimal(k[i-1]).minus(new Decimal(plowback_rate).minus((new Decimal(eps_growth).dividedBy(cost_of_equity_implied))).dividedBy(new Decimal(15))); }
            for(let i = 3; i <= 16; i++) { eps[i] = new Decimal(eps[i-1]).times((g[i].plus(new Decimal(1)))); }
            for(let i = 0; i <= 16; i++) { net_new_equity_investments[i] = new Decimal(k[i]).times(eps[i]); }
            for(let i = 0; i <= 16; i++) { fcfe[i] = new Decimal(eps[i]).minus(net_new_equity_investments[i]); }
            for(let i = 1; i <= 16; i++) { fcfe_growth[i] = new Decimal(fcfe[i]).dividedBy(fcfe[i-1]).minus(new Decimal(1)); }
            for(let i = 1; i <= 16; i++) { book_value_per_share[i] = new Decimal(book_value_per_share[i-1]).plus(eps[i]).minus(fcfe[i]); }
            for(let i = 1; i <= 16; i++) { roe[i] = new Decimal(eps[i]).dividedBy(book_value_per_share[i-1]); }
            for(let i = 1; i <= 16; i++) { roi[i] = new Decimal(eps[i]).minus(eps[i-1]).dividedBy(net_new_equity_investments[i-1]); }
            for(let i = 1; i <= 16; i++) { roe_less_re[i] = new Decimal(roe[i]).minus(cost_of_equity_implied); }
            for(let i = 1; i <= 16; i++) { ri[i] = new Decimal(roe_less_re[i]).times(book_value_per_share[i-1]); }

            // Discounted Free Cash Flow Valuation
            let fcfe_pv = new Decimal(0);
            for(let i = 1; i <= 16; i++) { fcfe_pv = fcfe_pv.plus(fcfe[i].div(Decimal.pow(new Decimal(1).plus(cost_of_equity_implied), i))); }
            let continuing_value_cash_flow_based = new Decimal(1)
                .div(Decimal.pow(new Decimal(1).plus(cost_of_equity_implied), 15))
                .times(fcfe[16].div(cost_of_equity_implied.minus(new Decimal(eps_growth))));
            let intrinsic_value_implied = fcfe_pv.plus(continuing_value_cash_flow_based);

            if(intrinsic_value_implied.lessThanOrEqualTo(new Decimal(stock_price))) {
                break;
            }
            cost_of_equity_implied = cost_of_equity_implied.add(0.0001);
        }
        
        setAdjustedBeta(parseFloat(adjusted_beta_decimal).toFixed(2));
        setGrowthRate(parseFloat(growth_rate_decimal.times(100)).toFixed(1));
        growth_rate = growth_rate_decimal.toNumber().toFixed(3);
        setCostOfEquity(parseFloat(cost_of_equity_decimal));
        setImpliedCostOfEquity(parseFloat(cost_of_equity_implied));
        setFe0(parseFloat(fe0_decimal).toFixed(2));
        setFe1(parseFloat(fe1_decimal).toFixed(2));
        setFe2(parseFloat(fe2_decimal).toFixed(2));
        setIntrinsicValue(parseFloat(intrinsic_value_decimal).toFixed(2));
        setProfitVolumeRatio(parseFloat(pv_ratio_decimal).toFixed(2));
        setAssetsInPlace(parseFloat(assets_in_place_decimal).toFixed(2));
        setPVGO(parseFloat(pvgo_decimal).toFixed(2));

        const equityValueData = calculateUnits(value_of_equity_decimal);
        setValueOfEquity(equityValueData.value.toFixed(2));
        setValueOfEquityUnit(equityValueData.unit);

        const firmValueData = calculateUnits(firm_value_decimal);
        setFirmValue(firmValueData.value.toFixed(2));
        setFirmValueUnit(firmValueData.unit);

        const enterpriseValueData = calculateUnits(enterprise_value_decimal);
        setEnterpriseValue(enterpriseValueData.value.toFixed(2));
        setEnterpriseValueUnit(enterpriseValueData.unit);

        setStatus("Done!");
        setError("");
    };

    const getValues = async() => {
        let temp_ticker = ticker_input.replace(/\s+/g, '').toUpperCase();
        if(temp_ticker === "") {
            setError("Please Input Valid Ticker");
            setStatus("Error");
            return;
        }
        const url = 'https://z8r04ropn7.execute-api.us-east-1.amazonaws.com/default/valuation-backend-dev-hello?ticker=' + temp_ticker;
        if(getting_values) {
            setError("Already Calculating Values");
            return;
        }
        
        try {
            setGettingValues(true);
            const response = await axios.get(url);
            setStatus("Calculating Values...");
            const data = response.data;
            setBaseTicker(ticker_input);
            data["stock_price"] = parseFloat(data["stock_price"]).toFixed(2)

            let trailing_dividend_rate = data["trailing_dividend_rate"];
            let payout_ratio = data["payout_ratio"];

            // Calculating values
            let shares_decimal = new Decimal(data["shares"]);
            let debt_decimal = new Decimal(data["debt"]);
            let cash_decimal = new Decimal(data["cash"]);
            let risk_premium_decimal = new Decimal(data["risk_premium"]);
            let risk_free_rate_decimal = new Decimal(data["risk_free_rate"]);
            let beta_decimal = new Decimal(data["beta"]);
            let book_value_decimal = new Decimal(data["book_value"]);
            let eps_growth_decimal = new Decimal(data["eps_growth"]);
            let fy0_decimal = new Decimal(data["fy0"]);
            let fy1_decimal = new Decimal(data["fy1"]);
            let fy2_decimal = new Decimal(data["fy2"]);
            let stock_price_decimal = new Decimal(data["stock_price"]);

            if(fy1_decimal.lessThan(new Decimal(0)) || fy2_decimal.lessThan(new Decimal(0))) {
                setError("Firm Cannot Be Valued: Negative Projected Earnings");
                setGettingValues(false);
                setStatus("Error");
                return;
            }

            let plowback_rate_decimal = new Decimal(0);
            if(payout_ratio === "N/A") {
                if(trailing_dividend_rate === "N/A") {
                    setError("Not enough information to calculate payout ratio.");
                    setGettingValues(false);
                    setStatus("Error");
                    return;
                } else if(fy1_decimal.lessThanOrEqualTo(0)) {
                    setError("Firm Cannot Be Valued: Negative Projected Earnings");
                    setGettingValues(false);
                    setStatus("Error");
                    return;
                } else {
                    plowback_rate_decimal = new Decimal(new Decimal(trailing_dividend_rate).div(fy0_decimal).toFixed(2));
                }
            } else {
                plowback_rate_decimal = new Decimal(1).minus(new Decimal(payout_ratio));
            }
            
            if(plowback_rate_decimal.lessThan(new Decimal(0))) {
                plowback_rate_decimal = new Decimal(0);
            } else if (plowback_rate_decimal.greaterThan(1)) {
                plowback_rate_decimal = new Decimal(1);
            }

            let growth_rate_decimal = new Decimal(fy2_decimal.div(fy1_decimal).minus(new Decimal(1)).toFixed(3));
            
            if(growth_rate_decimal.lessThan(0.01)) {
                growth_rate_decimal = new Decimal(0.01);
            } else if(growth_rate_decimal.greaterThan(new Decimal(0.75))) {
                growth_rate_decimal = new Decimal(0.75);
            }

            let adjusted_beta_decimal = new Decimal(1).dividedBy(3).plus(new Decimal(2).dividedBy(3).times(beta_decimal));
            let cost_of_equity_decimal = adjusted_beta_decimal.times(risk_premium_decimal).plus(risk_free_rate_decimal);
            
            let monthsToFYE_decimal = new Decimal(data["monthsToFYE"]);
            let fe0_decimal = new Decimal(monthsToFYE_decimal).div(12).times(fy0_decimal).plus(new Decimal(1).minus(monthsToFYE_decimal.div(12)).times(fy1_decimal));
            let fe1_decimal = new Decimal(monthsToFYE_decimal).div(12).times(fy1_decimal).plus(new Decimal(1).minus(monthsToFYE_decimal.div(12)).times(fy2_decimal));
            let fe2_decimal = new Decimal(fe1_decimal).times(new Decimal(1).plus(growth_rate_decimal));
            
            g[2] = growth_rate_decimal;
            k[0] = plowback_rate_decimal;
            k[1] = plowback_rate_decimal;
            eps[0] = fe0_decimal;
            eps[1] = fe1_decimal;
            eps[2] = fe2_decimal;
            book_value_per_share[0] = book_value_decimal;
            
            let temp = Decimal.exp(new Decimal(1).div(15).times(Decimal.log(eps_growth_decimal.div(growth_rate_decimal), Decimal.exp(1))));
            for(let i = 3; i <= 16; i++) { g[i] = new Decimal(g[i-1]).times(temp); }
            for(let i = 2; i <= 16; i++) { k[i] = new Decimal(k[i-1]).minus(plowback_rate_decimal.minus((eps_growth_decimal.dividedBy(cost_of_equity_decimal))).dividedBy(new Decimal(15))); }
            for(let i = 3; i <= 16; i++) { eps[i] = new Decimal(eps[i-1]).times((g[i].plus(new Decimal(1)))); }
            for(let i = 0; i <= 16; i++) { net_new_equity_investments[i] = new Decimal(k[i]).times(eps[i]); }
            for(let i = 0; i <= 16; i++) { fcfe[i] = new Decimal(eps[i]).minus(net_new_equity_investments[i]); }
            for(let i = 1; i <= 16; i++) { fcfe_growth[i] = new Decimal(fcfe[i]).dividedBy(fcfe[i-1]).minus(new Decimal(1)); }
            for(let i = 1; i <= 16; i++) { book_value_per_share[i] = new Decimal(book_value_per_share[i-1]).plus(eps[i]).minus(fcfe[i]); }
            for(let i = 1; i <= 16; i++) { roe[i] = new Decimal(eps[i]).dividedBy(book_value_per_share[i-1]); }
            for(let i = 1; i <= 16; i++) { roi[i] = new Decimal(eps[i]).minus(eps[i-1]).dividedBy(net_new_equity_investments[i-1]); }
            for(let i = 1; i <= 16; i++) { roe_less_re[i] = new Decimal(roe[i]).minus(cost_of_equity_decimal); }
            for(let i = 1; i <= 16; i++) { ri[i] = new Decimal(roe_less_re[i]).times(book_value_per_share[i-1]); }

            // Discounted Free Cash Flow Valuation
            let fcfe_pv = new Decimal(0);
            for(let i = 1; i <= 16; i++) { fcfe_pv = fcfe_pv.plus(fcfe[i].div(Decimal.pow(new Decimal(1).plus(cost_of_equity_decimal), i))); }
            let continuing_value_cash_flow_based = new Decimal(1)
                .div(Decimal.pow(new Decimal(1).plus(cost_of_equity_decimal), 15))
                .times(fcfe[16].div(cost_of_equity_decimal.minus(eps_growth_decimal)));
            let intrinsic_value_decimal = fcfe_pv.plus(continuing_value_cash_flow_based);
            let pv_ratio_decimal = stock_price_decimal.div(intrinsic_value_decimal);

            // Value of assets in place & PVGO
            let assets_in_place_decimal = new Decimal(fe1_decimal).dividedBy(cost_of_equity_decimal);
            let pvgo_decimal = intrinsic_value_decimal.minus(assets_in_place_decimal);

            // Firm Valuation
            let value_of_equity_decimal = intrinsic_value_decimal.times(shares_decimal);
            let firm_value_decimal = value_of_equity_decimal.plus(debt_decimal);
            let enterprise_value_decimal = firm_value_decimal.minus(cash_decimal);
            
            let cost_of_equity_implied = new Decimal(0.0001);
            while(true) {
                g[2] = growth_rate_decimal;
                k[0] = plowback_rate_decimal;
                k[1] = plowback_rate_decimal;
                eps[0] = fe0_decimal;
                eps[1] = fe1_decimal;
                eps[2] = fe2_decimal;
                book_value_per_share[0] = book_value_decimal;
                
                let temp = Decimal.exp(new Decimal(1).div(15).times(Decimal.log(eps_growth_decimal.div(growth_rate_decimal), Decimal.exp(1))));
                for(let i = 3; i <= 16; i++) { g[i] = new Decimal(g[i-1]).times(temp); }
                for(let i = 2; i <= 16; i++) { k[i] = new Decimal(k[i-1]).minus(plowback_rate_decimal.minus((eps_growth_decimal.dividedBy(cost_of_equity_implied))).dividedBy(new Decimal(15))); }
                for(let i = 3; i <= 16; i++) { eps[i] = new Decimal(eps[i-1]).times((g[i].plus(new Decimal(1)))); }
                for(let i = 0; i <= 16; i++) { net_new_equity_investments[i] = new Decimal(k[i]).times(eps[i]); }
                for(let i = 0; i <= 16; i++) { fcfe[i] = new Decimal(eps[i]).minus(net_new_equity_investments[i]); }
                for(let i = 1; i <= 16; i++) { fcfe_growth[i] = new Decimal(fcfe[i]).dividedBy(fcfe[i-1]).minus(new Decimal(1)); }
                for(let i = 1; i <= 16; i++) { book_value_per_share[i] = new Decimal(book_value_per_share[i-1]).plus(eps[i]).minus(fcfe[i]); }
                for(let i = 1; i <= 16; i++) { roe[i] = new Decimal(eps[i]).dividedBy(book_value_per_share[i-1]); }
                for(let i = 1; i <= 16; i++) { roi[i] = new Decimal(eps[i]).minus(eps[i-1]).dividedBy(net_new_equity_investments[i-1]); }
                for(let i = 1; i <= 16; i++) { roe_less_re[i] = new Decimal(roe[i]).minus(cost_of_equity_implied); }
                for(let i = 1; i <= 16; i++) { ri[i] = new Decimal(roe_less_re[i]).times(book_value_per_share[i-1]); }

                // Discounted Free Cash Flow Valuation
                let fcfe_pv = new Decimal(0);
                for(let i = 1; i <= 16; i++) { fcfe_pv = fcfe_pv.plus(fcfe[i].div(Decimal.pow(new Decimal(1).plus(cost_of_equity_implied), i))); }
                let continuing_value_cash_flow_based = new Decimal(1)
                    .div(Decimal.pow(new Decimal(1).plus(cost_of_equity_implied), 15))
                    .times(fcfe[16].div(cost_of_equity_implied.minus(eps_growth_decimal)));
                let intrinsic_value_implied = fcfe_pv.plus(continuing_value_cash_flow_based);

                if(intrinsic_value_implied.lessThanOrEqualTo(stock_price_decimal)) {
                    break;
                }

                cost_of_equity_implied = cost_of_equity_implied.add(0.0001);
            }

            
            setFY1(data["fy1"]);
            setFY2(data["fy2"]);
            setRiskPremium(data["risk_premium"]*100);
            setStockPrice(data["stock_price"]);
            setBeta(data["beta"]);
            setMonthsToFYE(data["monthsToFYE"]);
            setBookValue(data["book_value"]);
            setFy0(data["fy0"]);
            setRiskFreeRate(data["risk_free_rate"]);
            setEpsGrowth(data["eps_growth"]);

            const sharesData = calculateUnits(parseInt(data["shares"]));
            setShares(sharesData.value);
            setSharesUnit(sharesData.unit);
            const debtData = calculateUnits(parseInt(data["debt"]));
            setDebt(debtData.value);
            setDebtUnit(debtData.unit);
            const cashData = calculateUnits(parseInt(data["cash"]));
            setCash(cashData.value);
            setCashUnit(cashData.unit);

            setAdjustedBeta(parseFloat(adjusted_beta_decimal).toFixed(2));
            setGrowthRate(parseFloat(growth_rate_decimal.times(100)).toFixed(1));
            growth_rate = growth_rate_decimal.toNumber().toFixed(3);
            setCostOfEquity(parseFloat(cost_of_equity_decimal));
            setImpliedCostOfEquity(parseFloat(cost_of_equity_implied));
            setFe0(parseFloat(fe0_decimal).toFixed(2));
            setFe1(parseFloat(fe1_decimal).toFixed(2));
            setFe2(parseFloat(fe2_decimal).toFixed(2));
            setIntrinsicValue(parseFloat(intrinsic_value_decimal).toFixed(2));
            setProfitVolumeRatio(parseFloat(pv_ratio_decimal).toFixed(2));
            setAssetsInPlace(parseFloat(assets_in_place_decimal).toFixed(2));
            setPVGO(parseFloat(pvgo_decimal).toFixed(2));
            setPlowbackRate(plowback_rate_decimal);

            const equityValueData = calculateUnits(value_of_equity_decimal);
            setValueOfEquity(equityValueData.value.toFixed(2));
            setValueOfEquityUnit(equityValueData.unit);
            const firmValueData = calculateUnits(firm_value_decimal);
            setFirmValue(firmValueData.value.toFixed(2));
            setFirmValueUnit(firmValueData.unit);
            const enterpriseValueData = calculateUnits(enterprise_value_decimal);
            setEnterpriseValue(enterpriseValueData.value.toFixed(2));
            setEnterpriseValueUnit(enterpriseValueData.unit);

            setAltFy1(data["fy1"]);
            setAltFy2(data["fy2"]);
            setAltGrowthRate(parseFloat(growth_rate_decimal.times(100)).toFixed(1));
            alt_growth_rate = growth_rate_decimal.toNumber().toFixed(3);
            setAltPlowbackRate(parseFloat(plowback_rate_decimal));
            setAltRiskPremium(data["risk_premium"]*100);
            setAltFy0(data["fy0"]);
            setAltMonthsToFYE(parseInt(data["monthsToFYE"]));
            setAltFe0(parseFloat(fe0_decimal).toFixed(2));
            setAltFe1(parseFloat(fe1_decimal).toFixed(2));
            setAltFe2(parseFloat(fe2_decimal).toFixed(2));
            setAltEpsGrowth(data["eps_growth"]);
            setAltBookValue(data["book_value"]);
            setAltStockPrice(data["stock_price"]);
            setAltRiskFreeRate(data["risk_free_rate"]);
            setAltBeta(data["beta"]);
            setAltAdjustedBeta(parseFloat(adjusted_beta_decimal).toFixed(2));
            setAltCostOfEquity(parseFloat(cost_of_equity_decimal));
            setAltImpliedCostOfEquity(parseFloat(cost_of_equity_implied));
            setAltIntrinsicValue(parseFloat(parseFloat(intrinsic_value_decimal)).toFixed(2));
            setAltProfitVolumeRatio(parseFloat(parseFloat(pv_ratio_decimal)).toFixed(2));
            setAltAssetsInPlace(parseFloat(assets_in_place_decimal).toFixed(2));
            setAltPVGO(parseFloat(pvgo_decimal).toFixed(2));

            setAltShares(sharesData.value);
            setAltSharesUnit(sharesData.unit);
            setAltDebt(debtData.value);
            setAltDebtUnit(debtData.unit);
            setAltCash(cashData.value);
            setAltCashUnit(cashData.unit);
            setAltValueOfEquity(equityValueData.value.toFixed(2));
            setAltValueOfEquityUnit(equityValueData.unit);
            setAltFirmValue(firmValueData.value.toFixed(2));
            setAltFirmValueUnit(firmValueData.unit);
            setAltEnterpriseValue(enterpriseValueData.value.toFixed(2));
            setAltEnterpriseValueUnit(enterpriseValueData.unit);

            setGettingValues(false);
            setStatus("Done!");
            setError("");
            
        } catch(error) {
            setGettingValues(false);
            setStatus("Error");
            if(error.response && error.response.status === 400) {
                setError("Please input a valid ticker.");
            } else if(error.response && error.response.status === 503) {
                setError("Data for that stock is unavailable at the moment.");
            } else if(error.response && error.response.status === 500) {
                setError("Unknown Error retrieving data.");
            } else {
                setError("Unkown Error: " + error);
                console.log(error);
            }
        }
    };

    const calculateUnits = (value) => {
        const units = ['', 'thousands', 'millions', 'billions', 'trillions', 'quadrillions', 'quintillions', 'sextillions'];
        const index = Math.floor(Math.log10(Math.abs(value)) / 3);
        const scaledValue = (value / Math.pow(10, index * 3));
        return {
            value: scaledValue,
            unit: units[index]
        };
    };

    const reverseCalculateUnits = (scaledValue, unit) => {
        const units = ['', 'thousands', 'millions', 'billions', 'trillions', 'quadrillions', 'quintillions', 'sextillions'];
    
        // Find the index of the given unit
        const index = units.indexOf(unit);
    
        if (index === -1) {
            throw new Error('Invalid unit provided.');
        }
    
        // Calculate the original value using the formula: originalValue = scaledValue * 10^(index * 3)
        const originalValue = scaledValue * Math.pow(10, index * 3);
    
        return originalValue;
    };

    if(isMobile) {
        return (
            <div>
                <div className="mobile-instructions-section">
                    <button onClick={toggleInstructions} className="mobile-instruction-button">See Instructions</button>
                    <div id="mobile-instructions" className={`instructions ${showInstructions ? "show" : ""}`}>
                        <p id="instruction-header">
                            Instructions:
                        </p>
                        <ul>
                            <li>Type in a Ticker for a US publicly traded company in the Ticker box.</li>
                            <li>Click the "Calculate" button to compute valuations using Yahoo Finance data.</li>
                            <li>You can also input your own data in some boxes and click "Calculate" for your own valuations.</li>
                            <li>To restore the Yahoo Finance data, simply click the "Restore" button.</li>
                        </ul>
                    </div>
                </div>
                <div className="mobile-ticker-section">
                    <div>
                        <label className="ticker-label">Ticker:</label>
                        <input type="text" value={ticker_input} onChange={(e) => handleTickerChange(e, setTicker)} size="5" maxLength="5" onKeyDown={handleKeyDown} />
                        <button onClick={run}>Calculate</button>
                        <button onClick={restore}>Restore</button>
                        <label className="status-indicator">{status}</label>
                    </div>
                </div>
                
                <div className="mobile-tables-container">
                    <table id="mainTable">
                        <tr>
                            <th colSpan="2">Summary of Input Data</th>
                        </tr>
                        <tr>
                            <td>Current Fiscal Year EPS0 ($)</td>
                            <td>{fy0}</td>
                        </tr>
                        <tr>
                            <td>FY1 Consensus EPS Forecast ($)</td>
                            <td className="inputCell">
                                <input type="number" value={FY1_input} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setFY1)} />
                            </td>
                        </tr>
                        <tr>
                            <td>FY2 Consensus EPS Forecast ($)</td>
                            <td className="inputCell">
                                <input type="number" value={FY2_input} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setFY2)} />
                            </td>
                        </tr>
                        <tr>
                            <td># Months to Fiscal Year End</td>
                            <td>{monthsToFYE}</td>
                        </tr>
                        <tr>
                            <td>Trailing 12-month EPS (FE0)</td>
                            <td>{fe0}</td>
                        </tr>
                        <tr>
                            <td>12-month forecast (FE1)</td>
                            <td>{fe1}</td>
                        </tr>
                        <tr>
                            <td>Subsequent 12 months (FE2)</td>
                            <td>{fe2}</td>
                        </tr>
                        <tr>
                            <td>Year 2 Growth Rate Forecast (g2)</td>
                            <td className="input-cell-percentage">
                                <div class="percentage-cell-content">
                                    <input type="number" value={growth_rate_input} step="0.1" min="1" max="75" onChange={(e) => handleInputChange(e, setGrowthRate)} />
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Plowback rate
                                <span className="tooltip" data-tooltip="1 - payout ratio"></span>
                            </td>
                            <td className="input-cell-percentage">
                                <input type="number" value={plowback_rate_input} step="0.01" max="1" min="0" onChange={(e) => handleInputChange(e, setPlowbackRate)} />
                            </td>
                        </tr>
                        <tr>
                            <td>Steady-state EPS Growth</td>
                            <td>
                                <div class="percentage-cell-content">
                                    <span>{((eps_growth*100).toFixed(2))}</span>
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Steady-state ROI
                                <span className="tooltip" data-tooltip="Set to Cost of Equity"></span>
                            </td>
                            <td>
                                <div class="percentage-cell-content">
                                    <span>{((cost_of_equity*100).toFixed(2))}</span>
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Book Value of Equity Per Share</td>
                            <td>{book_value}</td>
                        </tr>
                        <tr>
                            <td>Current Stock Price ($)</td>
                            <td>{stock_price}</td>
                        </tr>
                        <tr>
                            <td># Shares Outstanding ({shares_unit})</td>
                            <td>{shares}</td>
                        </tr>
                        <tr>
                            <td>Total Debt ({debt_unit} $)</td>
                            <td>{debt}</td>
                        </tr>
                        <tr>
                            <td>Total Cash ({cash_unit} $)</td>
                            <td>{cash}</td>
                        </tr>
                    </table>
                    <table id="costOfEquity">
                        <tr>
                            <th colSpan="2">
                                CAPM Cost of Equity Calculation
                                <span className="tooltip" id="tooltip-header" data-tooltip="CAPM: Capital Asset Pricing Model"></span>
                            </th>
                        </tr>
                        <tr>
                            <td>
                                Risk-free rate
                                <span className="tooltip" data-tooltip="Yield on 30-year U.S. govt. bond"></span>
                            </td>
                            <td>
                                <div class="percentage-cell-content">
                                    <span>{((risk_free_rate*100).toFixed(2))}</span>
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Raw Beta</td>
                            <td className="inputCell">
                                <input type="number" value={beta} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setBeta)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Adjusted Beta
                                <span className="tooltip" data-tooltip="1/3 + 2/3*raw beta"></span>
                            </td>
                            <td>{adjusted_beta}</td>
                        </tr>
                        <tr>
                            <td>
                                Risk premium on U.S. market
                                <span className="tooltip" data-tooltip="rm - rf"></span>
                            </td>
                            <td className="input-cell-percentage">
                                <div class="percentage-cell-content">
                                    <input type="number" value={risk_premium_input} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setRiskPremium)} />
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>CAPM Cost of Equity (re)</td>
                            <td>
                                <div class="percentage-cell-content">
                                    <span>{((cost_of_equity*100).toFixed(2))}</span>
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Implied Cost of Equity
                                <span className="tooltip" data-tooltip="This is the internal rate of return (IRR) that equates the intrinsic value of a stock to its price."></span>
                            </td>
                            <td>
                                <div class="percentage-cell-content">
                                    <span>{((implied_cost_of_equity*100).toFixed(2))}</span>
                                    <span>%</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <table id="valuationTable">
                        <tr>
                            <th colSpan="2">Equity & Firm Valuation</th>
                        </tr>
                        <tr>
                            <td>Value of Equity Per Share ($)</td>
                            <td>{intrinsic_value_of_equity_per_share_dfc}</td>
                        </tr>
                        <tr>
                            <td>P/V Ratio</td>
                            <td>{profit_volume_ratio}</td>
                        </tr>
                        <tr>
                            <td>Value of assets-in-place ($)</td>
                            <td>{assets_in_place_value}</td>
                        </tr>
                        <tr>
                            <td>
                                PVGO ($)
                                <span className="tooltip" data-tooltip="Present Value of Growth Opportunities"></span>
                            </td>
                            <td>{pvgo}</td>
                        </tr>
                        <tr>
                            <td>Value of Equity ({value_of_equity_unit} $)</td>
                            <td>{value_of_equity}</td>
                        </tr>
                        <tr>
                            <td>Value of Debt ({debt_unit} $)</td>
                            <td>{debt}</td>
                        </tr>
                        <tr>
                            <td>Total Firm Value ({firm_value_unit} $)</td>
                            <td>{total_firm_value}</td>
                        </tr>
                        <tr>
                            <td>
                                Total Enterprise Value ({enterprise_value_unit} $)
                                <span className="tooltip" data-tooltip="total firm value - cash"></span>
                            </td>
                            <td>{total_enterprise_value}</td>
                        </tr>
                    </table>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div className="ticker-section">
                    <div>
                        <button onClick={toggleInstructions}>See Instructions</button>
                        <label className="ticker-label">Ticker:</label>
                        <input type="text" value={ticker_input} onChange={(e) => handleTickerChange(e, setTicker)} size="5" maxLength="5" onKeyDown={handleKeyDown} />
                        <button onClick={run}>Calculate</button>
                        <button onClick={restore}>Restore</button>
                        <label className="status-indicator">{status}</label>
                    </div>
                </div>
                <div className={`instructions ${showInstructions ? "show" : ""}`}>
                    <p>
                        Instructions:
                    </p>
                    <ul>
                        <li>Type in a Ticker for a US publicly traded company in the Ticker box.</li>
                        <li>Click the "Calculate" button to compute valuations using Yahoo Finance data.</li>
                        <li>You can also input your own data in some boxes and click "Calculate" for your own valuations.</li>
                        <li>To restore the Yahoo Finance data, simply click the "Restore" button.</li>
                    </ul>
                </div>
                <div className="flex-container">
                    <div className="left-section">
                        <table id="mainTable">
                            <tr>
                                <th colSpan="2">Summary of Input Data</th>
                            </tr>
                            <tr>
                                <td>Current Fiscal Year EPS0 ($)</td>
                                <td>{fy0}</td>
                            </tr>
                            <tr>
                                <td>FY1 Consensus EPS Forecast ($)</td>
                                <td className="inputCell">
                                    <input type="number" value={FY1_input} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setFY1)} />
                                </td>
                            </tr>
                            <tr>
                                <td>FY2 Consensus EPS Forecast ($)</td>
                                <td className="inputCell">
                                    <input type="number" value={FY2_input} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setFY2)} />
                                </td>
                            </tr>
                            <tr>
                                <td># Months to Fiscal Year End</td>
                                <td>{monthsToFYE}</td>
                            </tr>
                            <tr>
                                <td>Trailing 12-month EPS (FE0)</td>
                                <td>{fe0}</td>
                            </tr>
                            <tr>
                                <td>12-month forecast (FE1)</td>
                                <td>{fe1}</td>
                            </tr>
                            <tr>
                                <td>Subsequent 12 months (FE2)</td>
                                <td>{fe2}</td>
                            </tr>
                            <tr>
                                <td>Year 2 Growth Rate Forecast (g2)</td>
                                <td className="input-cell-percentage">
                                    <div class="percentage-cell-content">
                                        <input type="number" value={growth_rate_input} step="0.1" min="1" max="75" onChange={(e) => handleInputChange(e, setGrowthRate)} />
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Plowback rate
                                    <span className="tooltip" data-tooltip="1 - payout ratio"></span>
                                </td>
                                <td className="input-cell-percentage">
                                    <input type="number" value={plowback_rate_input} step="0.01" max="1" min="0" onChange={(e) => handleInputChange(e, setPlowbackRate)} />
                                </td>
                            </tr>
                            <tr>
                                <td>Steady-state EPS Growth</td>
                                <td>
                                    <div class="percentage-cell-content">
                                        <span>{((eps_growth*100).toFixed(2))}</span>
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Steady-state ROI
                                    <span className="tooltip" data-tooltip="Set to Cost of Equity"></span>
                                </td>
                                <td>
                                    <div class="percentage-cell-content">
                                        <span>{((cost_of_equity*100).toFixed(2))}</span>
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Book Value of Equity Per Share</td>
                                <td>{book_value}</td>
                            </tr>
                            <tr>
                                <td>Current Stock Price ($)</td>
                                <td>{stock_price}</td>
                            </tr>
                            <tr>
                                <td># Shares Outstanding ({shares_unit})</td>
                                <td>{shares}</td>
                            </tr>
                            <tr>
                                <td>Total Debt ({debt_unit} $)</td>
                                <td>{debt}</td>
                            </tr>
                            <tr>
                                <td>Total Cash ({cash_unit} $)</td>
                                <td>{cash}</td>
                            </tr>
                        </table>
                    </div>
                    <div className="right-section">
                        <table id="costOfEquity">
                            <tr>
                                <th colSpan="2">
                                    CAPM Cost of Equity Calculation
                                    <span className="tooltip" id="tooltip-header" data-tooltip="CAPM: Capital Asset Pricing Model"></span>
                                </th>
                            </tr>
                            <tr>
                                <td>
                                    Risk-free rate
                                    <span className="tooltip" data-tooltip="Yield on 30-year U.S. govt. bond"></span>
                                </td>
                                <td>
                                    <div class="percentage-cell-content">
                                        <span>{((risk_free_rate*100).toFixed(2))}</span>
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Raw Beta</td>
                                <td className="inputCell">
                                    <input type="number" value={beta} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setBeta)} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Adjusted Beta
                                    <span className="tooltip" data-tooltip="1/3 + 2/3*raw beta"></span>
                                </td>
                                <td>{adjusted_beta}</td>
                            </tr>
                            <tr>
                                <td>
                                    Risk premium on U.S. market
                                    <span className="tooltip" data-tooltip="rm - rf"></span>
                                </td>
                                <td className="input-cell-percentage">
                                    <div class="percentage-cell-content">
                                        <input type="number" value={risk_premium_input} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setRiskPremium)} />
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>CAPM Cost of Equity (re)</td>
                                <td>
                                    <div class="percentage-cell-content">
                                        <span>{((cost_of_equity*100).toFixed(2))}</span>
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Implied Cost of Equity
                                    <span className="tooltip" data-tooltip="This is the internal rate of return (IRR) that equates the intrinsic value of a stock to its price."></span>
                                </td>
                                <td>
                                    <div class="percentage-cell-content">
                                        <span>{((implied_cost_of_equity*100).toFixed(2))}</span>
                                        <span>%</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        <table id="valuationTable">
                            <tr>
                                <th colSpan="2">Equity & Firm Valuation</th>
                            </tr>
                            <tr>
                                <td>Value of Equity Per Share ($)</td>
                                <td>{intrinsic_value_of_equity_per_share_dfc}</td>
                            </tr>
                            <tr>
                                <td>P/V Ratio</td>
                                <td>{profit_volume_ratio}</td>
                            </tr>
                            <tr>
                                <td>Value of assets-in-place ($)</td>
                                <td>{assets_in_place_value}</td>
                            </tr>
                            <tr>
                                <td>
                                    PVGO ($)
                                    <span className="tooltip" data-tooltip="Present Value of Growth Opportunities"></span>
                                </td>
                                <td>{pvgo}</td>
                            </tr>
                            <tr>
                                <td>Value of Equity ({value_of_equity_unit} $)</td>
                                <td>{value_of_equity}</td>
                            </tr>
                            <tr>
                                <td>Value of Debt ({debt_unit} $)</td>
                                <td>{debt}</td>
                            </tr>
                            <tr>
                                <td>Total Firm Value ({firm_value_unit} $)</td>
                                <td>{total_firm_value}</td>
                            </tr>
                            <tr>
                                <td>
                                    Total Enterprise Value ({enterprise_value_unit} $)
                                    <span className="tooltip" data-tooltip="total firm value - cash"></span>
                                </td>
                                <td>{total_enterprise_value}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
};

export default Table;