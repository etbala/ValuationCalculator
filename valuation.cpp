#include <emscripten.h>
#include <math.h>

extern "C" {
    //EMSCRIPTEN_KEEPALIVE
    double derivative_of_dcf(double* cash_flows, double cost_of_equity) {
        double derivative = 0.0;
        for (size_t t = 1; t <= 16; ++t) {
            derivative -= t * cash_flows[t - 1] / pow(1 + cost_of_equity, t + 1);
        }
        return derivative;
    }
    
    //EMSCRIPTEN_KEEPALIVE
    double* calculateValues(int shares, int debt, int cash, double risk_premium, 
                        double risk_free_rate, double beta, double book_value, 
                        double eps_growth, double fy0, double fy1, double fy2, 
                        double stock_price, double plowback_rate, int months_to_fye) {
        
        double g[16];           // Growth in New Income or EPS
        double k[16];           // Plowback Rate
        double eps[16];         // Earnings Per Share before Extraordinary Items
        double net_new_equity_investments[16];
        double fcfe[16];        // Free Cash Flow to Equity
        double fcfe_growth[16]; // Free Cash Flow to Equity Growth
        double book_value_per_share[16];
        double roe[16];         // Return on Book Equity
        double roi[16];         // Return on new equity Investments
        double ri[16];          // Residual Income (EVA for Shareholders)
        double roe_less_re[16]; // ROE - Cost of Equity

        double growth_rate = fy2/fy1-(1/3);
        if(growth_rate <= 0) {
            growth_rate = 0.01;
        } else if (growth_rate > 0.75) {
            growth_rate = 0.75;
        }

        double adjusted_beta = (1/3) + (2/3)*beta;
        double cost_of_equity = adjusted_beta*risk_premium + risk_free_rate;

        double fe0 = (months_to_fye/12)*fy0 + (1-months_to_fye/12)*fy1;
        double fe1 = (months_to_fye/12)*fy1 + (1-months_to_fye/12)*fy2;
        double fe2 = fe1 * (1 + growth_rate);

        g[2] = growth_rate;
        k[0] = plowback_rate;
        k[1] = plowback_rate;
        eps[0] = fe0;
        eps[1] = fe1;
        eps[2] = fe2;
        book_value_per_share[0] = book_value;

        double temp = (1/15)*log(eps_growth/growth_rate);
        for(int i = 3; i <= 16; i++) { g[i] = g[i-1]*temp; }
        for(int i = 2; i <= 16; i++) { k[i] = k[i-1] - ((plowback_rate - (eps_growth/cost_of_equity))/15); }
        for(int i = 3; i <= 16; i++) { eps[i] = eps[i-1]*(g[i]+1); }
        for(int i = 0; i <= 16; i++) { net_new_equity_investments[i] = k[i]*eps[i]; }
        for(int i = 0; i <= 16; i++) { fcfe[i] = eps[i] - net_new_equity_investments[i]; }
        for(int i = 1; i <= 16; i++) { fcfe_growth[i] = fcfe[i]/fcfe[i-1]-1; }
        for(int i = 1; i <= 16; i++) { book_value_per_share[i] = book_value_per_share[i-1] + eps[i] - fcfe[i]; }
        for(int i = 1; i <= 16; i++) { roe[i] = eps[i]/book_value_per_share[i-1]; }
        for(int i = 1; i <= 16; i++) { roi[i] = eps[i] - eps[i-1]/net_new_equity_investments[i-1]; }
        for(int i = 1; i <= 16; i++) { roe_less_re[i] = roe[i] - cost_of_equity; }
        for(int i = 1; i <= 16; i++) { ri[i] = roe_less_re[i]*book_value_per_share[i-1]; }

        double fcfe_pv = 0;
        for(int i = 1; i <= 16; i++) { fcfe_pv += fcfe[i]/pow(1 + cost_of_equity, i); }
        double continuing_value_cash_flow_based = (1/(pow(1+cost_of_equity), 15))*(fcfe[16]/(cost_of_equity-eps_growth));
        double intrinsic_value = fcfe_pv + continuing_value_cash_flow_based;
        double pv_ratio = stock_price/intrinsic_value;

        double assets_in_place = fe1/cost_of_equity;
        double pvgo = intrinsic_value-assets_in_place;

        double value_of_equity = intrinsic_value*shares;
        double firm_value = value_of_equity+debt;
        double enterprise_value = firm_value - cash;

        // Calculate Implied Cost of Equity
        double implied_cost_of_equity = cost_of_equity;
        double tolerance = 0.01;
        double* fcfe2 = new double(16);
        double temp_intrinsic_value, derivative;
        while(fabs(temp_intrinsic_value - stock_price) > tolerance) {
            temp_intrinsic_value = calculateDCF(growth_rate, implied_cost_of_equity, risk_premium, risk_free_rate, beta, 
                                                book_value, eps_growth, fy0, fy1, fy2, stock_price, plowback_rate, months_to_fye, fcfe2);
            derivative = derivative_of_dcf(fcfe2, implied_cost_of_equity);
            implied_cost_of_equity -= (temp_intrinsic_value - stock_price) / derivative;
        }
        delete[] fcfe2;
    
        /* Returns the following values in the following order:
            1. Adjusted Beta
            2. Growth Rate
            3. Cost of Equity
            4. Implied Cost of Equity
            5. fe0
            6. fe1
            7. fe2
            8. Intrinsic Value
            9. PV Ratio
            10. Assets in Place
            11. PVGO
            12. Value of Equity
            13. Value of Firm
            14. Value of Enterprise
        */

       static double output[14];
       return output;
    }

    //EMSCRIPTEN_KEEPALIVE
    double calculateDCF(double growth_rate, double cost_of_equity, double risk_premium, 
                        double risk_free_rate, double beta, double book_value, 
                        double eps_growth, double fy0, double fy1, double fy2, 
                        double stock_price, double plowback_rate, int months_to_fye, double* fcfe) {
        
        double g[16];           // Growth in New Income or EPS
        double k[16];           // Plowback Rate
        double eps[16];         // Earnings Per Share before Extraordinary Items
        double net_new_equity_investments[16];

        double fe0 = (months_to_fye/12)*fy0 + (1-months_to_fye/12)*fy1;
        double fe1 = (months_to_fye/12)*fy1 + (1-months_to_fye/12)*fy2;
        double fe2 = fe1 * (1 + growth_rate);

        g[2] = growth_rate;
        k[0] = plowback_rate;
        k[1] = plowback_rate;
        eps[0] = fe0;
        eps[1] = fe1;
        eps[2] = fe2;

        double temp = (1/15)*log(eps_growth/growth_rate);
        for(int i = 3; i <= 16; i++) { g[i] = g[i-1]*temp; }
        for(int i = 2; i <= 16; i++) { k[i] = k[i-1] - ((plowback_rate - (eps_growth/cost_of_equity))/15); }
        for(int i = 3; i <= 16; i++) { eps[i] = eps[i-1]*(g[i]+1); }
        for(int i = 0; i <= 16; i++) { net_new_equity_investments[i] = k[i]*eps[i]; }
        for(int i = 0; i <= 16; i++) { fcfe[i] = eps[i] - net_new_equity_investments[i]; }

        double fcfe_pv = 0;
        for(int i = 1; i <= 16; i++) { fcfe_pv += fcfe[i]/pow(1 + cost_of_equity, i); }
        double continuing_value_cash_flow_based = (1/(pow(1+cost_of_equity), 15))*(fcfe[16]/(cost_of_equity-eps_growth));
        double intrinsic_value = fcfe_pv + continuing_value_cash_flow_based;
        
        return intrinsic_value;
    }
}