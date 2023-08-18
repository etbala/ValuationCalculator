import React, { useState } from 'react';
import './Table.css';
import axios from 'axios';

const Table = ({ setError }) => {
    // Input Values
    const [ticker, setTicker] = useState("");

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
    const [intrinsic_value_of_equity_per_share_dfc, setIntrinsicValue] = useState(0);
    const [profit_volume_ratio, setProfitVolumeRatio] = useState(0);

    const [shares_unit, setSharesUnit] = useState("");
    const [debt_unit, setDebtUnit] = useState("");
    const [cash_unit, setCashUnit] = useState("");
    
    let getting_values = false;
    let growth_rate_changed = false;

    // Scraped Values
    /*let stock_price = 0;
    let shares = 0;
    let monthsToFYE = 0;
    let book_value = 0;
    let beta = 0;
    let debt = 0;
    let cash = 0;
    let fy0 = 0;*/
    let fy1 = 0;
    let fy2 = 0;

    // Static (?) Values
    /*let eps_growth = 0.05;
    let risk_free_rate = 0.0397;*/
    let risk_premium = 0.05;

    //  Calculated Values
    // ##############################################
    /*let adjusted_beta = 0;
    let cost_of_equity = 0;*/
    let growth_rate = 0;
    /*let fe0 = 0.00;
    let fe1 = 0.00;
    let fe2 = 0.00;*/
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

    // Discounted Free Cash Flow Valuation
    let fcfe_pv                                 = 0;   // Present Value of FCFE during first 15 years
    let continuing_value_cash_flow_based        = 0;   // Continuing value based on cash flows beyond Year 15
    /*let intrinsic_value_of_equity_per_share_dfc = 0;   // Discounted Free Cash Flow Valuation
    let profit_volume_ratio                     = 0;   // Profit Volume Ratio*/

    // Discounted Residual Income Valuation
    //let residual_income_pv                      = 0;   // Residual Income Present Value first 15 years
    //let residual_income_cv                      = 0;   // Residual Income Continuing Value after 15 years
    //let intrinsic_value_of_equity_per_share_ri  = 0;   // Discounted Residual Income (EVA for shareholders) Valuation

    // Value of assets-in-place and PVGO
    //let assets_in_place_value                   = 0;   // Value of Assets in Place
    //let pvgo                                    = 0;   // Present Value of Growth Opportunities

    // Firm Valuation
    //let value_of_equity                         = 0;   // Value of Equity
    //let total_firm_value                        = 0;   // Total Firm Value
    //let total_enterprise_value                  = 0;   // Total Enterprise Value
    
    // Function to handle user input changes
    const handleInputChange = (e, setter) => {
        setter(parseFloat(e.target.value));
    };

    const handleTickerChange = (e, setter) => {
        if(e.target.value !== ticker) {
            setTicker(e.target.value);
        } else {
            fy1 = FY1_input;
            fy2 = FY2_input;
            plowback_rate = plowback_rate_input;
            risk_premium = risk_premium_input/100;

            if(growth_rate !== growth_rate_input/100) {
                growth_rate_changed = true;
            }
            growth_rate = growth_rate_input;

            calculateValues();
        }
    };

    const handleKeyDown = (event) => {
        if(event.key === 'Enter') {
            getValues();
        }
    }


    // Function to recalculate values based on user inputs
    const calculateValues = () => {
        //Convert Percentage Input Values
        

        // Computing Cost of Equity
        //setAdjustedBeta((1/3) + (2/3) * beta);
        setCostOfEquity((adjusted_beta * risk_premium + risk_free_rate).toFixed(3));

        /*
        // Date Handling
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let fiscal_month_str = fiscal_year_end.substring(0,3);

        let fiscal_month = -1;
        for(let i = 0; i < months.length; i++) {
            if(fiscal_month_str === months[i]) {
                fiscal_month = i;
                break;
            }
        }

        let current_month = (new Date()).getMonth();
        if(current_month > fiscal_month) {
            monthsToFYE = (fiscal_month + 12) - current_month;
        } else {
            monthsToFYE = fiscal_month - current_month;
        }
        */
        if(!growth_rate_changed) {
            setGrowthRate(fy2/fy1-1);
        }

        setFe0((monthsToFYE/12) * fy0 + ((1 - (monthsToFYE/12)) * fy1));
        setFe1((monthsToFYE/12) * fy1 + ((1 - (monthsToFYE/12)) * fy2));
        setFe2(fe1 * (1 + growth_rate));

        // Fill Constants in DCF Model
        g[2] = growth_rate;
        k[0] = plowback_rate;
        k[1] = plowback_rate;
        eps[0] = fe0;
        eps[1] = fe1;
        eps[2] = fe2;
        book_value_per_share[0] = book_value;

        // Table Calculations
        let temp = Math.E ** (1/15*Math.log(eps_growth/growth_rate));
        for(let i = 3; i <= 16; i++) { g[i] = g[i-1] * temp; }
        for(let i = 2; i <= 16; i++) { k[i] = k[i-1] - (plowback_rate - (eps_growth/cost_of_equity))/15; }
        for(let i = 3; i <= 16; i++) { eps[i] = eps[i-1] * (1+g[i]); }
        for(let i = 0; i <= 16; i++) { net_new_equity_investments[i] = k[i] * eps[i]; }
        for(let i = 0; i <= 16; i++) { fcfe[i] = eps[i] - net_new_equity_investments[i]; }
        for(let i = 1; i <= 16; i++) { fcfe_growth[i] = fcfe[i]/fcfe[i-1] - 1; }
        for(let i = 1; i <= 16; i++) { book_value_per_share[i] = book_value_per_share[i-1] + eps[i] - fcfe[i]; }
        for(let i = 1; i <= 16; i++) { roe[i] = eps[i]/book_value_per_share[i-1]; }
        for(let i = 1; i <= 16; i++) { roi[i] = (eps[i] - eps[i-1])/net_new_equity_investments[i-1]; }
        for(let i = 1; i <= 16; i++) { roe_less_re[i] = roe[i] - cost_of_equity; }
        for(let i = 1; i <= 16; i++) { ri[i] = roe_less_re[i] * book_value_per_share[i-1]; }

        // Discounted Residual Income (EVA for Shareholders) Valuation
        //residual_income_pv = 0;
        //for(let i = 1; i <= 16; i++) { residual_income_pv = residual_income_pv + ri[i]/((1+cost_of_equity)**i); }
        //residual_income_cv = (1/(1+cost_of_equity) ** 15) * (ri[16]/cost_of_equity+(eps[16]*(eps_growth/cost_of_equity)*(cost_of_equity-cost_of_equity))/(cost_of_equity*(cost_of_equity-eps_growth)));
        //intrinsic_value_of_equity_per_share_ri = book_value + residual_income_pv + residual_income_cv;

        // Discounted Free Cash Flow Valuation
        fcfe_pv = 0;
        for(let i = 1; i <= 16; i++) { fcfe_pv = fcfe_pv + fcfe[i]/((1+cost_of_equity)**i); }
        continuing_value_cash_flow_based = (1/(1+cost_of_equity) ** 15) * fcfe[16]/(cost_of_equity-eps_growth);
        setIntrinsicValue(fcfe_pv + continuing_value_cash_flow_based);
        setProfitVolumeRatio(stock_price/intrinsic_value_of_equity_per_share_dfc);

        // Value of assets in place & PVGO
        //assets_in_place_value = fe1/cost_of_equity;
        //pvgo = intrinsic_value_of_equity_per_share_dfc - assets_in_place_value;

        // Firm Valuation
        //value_of_equity = intrinsic_value_of_equity_per_share_dfc * shares;
        //total_firm_value = value_of_equity + debt;
        //total_enterprise_value = total_firm_value - cash;
    };

    const getValues = async () => {
        const url = 'https://iumt93w93d.execute-api.us-east-1.amazonaws.com/default/valuation-backend-dev-hello?ticker=' + ticker;
        getting_values = true;

        try {
            const response = await axios.get(url);
            const data = response.data;
            getting_values = false;

            setFY1(data["fy1"].toFixed(2));
            setFY2(data["fy2"].toFixed(2));
            setGrowthRate(data["growth_rate"]*100);
            setPlowbackRate(data["plowback_rate"].toFixed(2));
            setRiskPremium(data["risk_premium"]*100);
            setFy0(data["fy0"].toFixed(2));
            setMonthsToFYE(parseInt(data["monthsToFYE"]));
            setFe0(data["fe0"].toFixed(2));
            setFe1(data["fe1"].toFixed(2));
            setFe2(data["fe2"].toFixed(2));
            setEpsGrowth(data["eps_growth"]);
            setBookValue(data["book_value"]);
            setStockPrice(data["stock_price"]);
            setRiskFreeRate(data["risk_free_rate"]);
            setBeta(data["beta"]);
            setAdjustedBeta(data["adjusted_beta"]);
            setCostOfEquity(data["cost_of_equity"]);
            setIntrinsicValue(parseFloat(data["intrinsic_equity_per_share"]));
            setProfitVolumeRatio(parseFloat(data["profit_volume_ratio"]));

            const sharesData = calculateUnits(parseInt(data["shares"]));
            setShares(sharesData.value);
            setSharesUnit(sharesData.unit);

            const debtData = calculateUnits(parseInt(data["debt"]));
            setDebt(debtData.value);
            setDebtUnit(debtData.unit);

            const cashData = calculateUnits(parseInt(data["cash"]));
            setCash(cashData.value);
            setCashUnit(cashData.unit);

        } catch(error) {
            console.log("Error:", error);
            if(error.response && error.response.status === 500) {
                setError("Please Input Valid Ticker");
            } else {
                setError("Unkown Backend Error");
            }
        }      
    };

    return (
        <div className="flex-container">
            <div className="left-section">
                <table id="mainTable">
                    <tr>
                        <th>Label</th>
                        <th>Value</th>
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
                                <input type="number" value={(growth_rate_input.toFixed(1))} step="0.1" min="0.1" onChange={(e) => handleInputChange(e, setGrowthRate)} />
                                <span>%</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Plowback rate
                            <span className="tooltip" data-tooltip="Calculated as (1 - Payout Ratio)"></span>
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
                            <span className="tooltip" data-tooltip="Initially Set to Cost of Equity"></span>
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
                        <td>{(book_value.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td>Current Stock Price ($)</td>
                        <td>{(stock_price.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td>Number of Shares Outstanding ({shares_unit})</td>
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
                <div className="ticker-section">
                    <label>
                        Ticker:
                        <input type="text" value={ticker} onChange={(e) => handleTickerChange(e, setTicker)} size="4" maxLength="4" onKeyDown={handleKeyDown} />
                        <button onClick={getValues}>Calculate</button>
                    </label>
                </div>
                <table id="costOfEquity">
                    <tr>
                        <th>Label</th>
                        <th>Value</th>
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
                        <td>{(beta.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td>
                            Adjusted Beta
                            <span className="tooltip" data-tooltip="1/3 + 2/3*raw beta"></span>
                        </td>
                        <td>{(adjusted_beta.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td>
                            Risk premium on U.S. market
                            <span className="tooltip" data-tooltip="rm - rf"></span>
                        </td>
                        <td className="input-cell-percentage">
                            <div class="percentage-cell-content">
                                <input type="number" value={(risk_premium_input.toFixed(2))} step="0.01" min="0.01" onChange={(e) => handleInputChange(e, setRiskPremium)} />
                                <span>%</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Cost of Equity (re)</td>
                        <td>
                            <div class="percentage-cell-content">
                                <span>{((cost_of_equity*100).toFixed(2))}</span>
                                <span>%</span>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                <table id="valuationTable">
                    <tr>
                        <th>Label</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Value of Equity Per Share</td>
                        <td>{(intrinsic_value_of_equity_per_share_dfc.toFixed(2))}</td>
                    </tr>
                    <tr>
                        <td>P/V Ratio</td>
                        <td>{(profit_volume_ratio.toFixed(2))}</td>
                    </tr>
                </table>
            </div>
        </div>
    );
};

export default Table;