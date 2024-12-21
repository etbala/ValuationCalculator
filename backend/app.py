from flask import Flask, request, jsonify, send_from_directory
import yfinance as yf
from datetime import datetime
import pandas as pd

# Flask app initialization
app = Flask(__name__, static_folder="../frontend/build", static_url_path="")

# Static values
RISK_PREMIUM = 0.05
EPS_GROWTH = 0.05

def get_risk_free_rate():
    try:
        treasury_ticker = "^TYX"  # 30-Year Treasury bond yield ticker
        treasury = yf.Ticker(treasury_ticker)
        data = treasury.history(period="1d")
        if not data.empty:
            return data["Close"].iloc[-1] / 100  # Convert percentage to decimal
        return 0.04  # Default fallback
    except Exception:
        return 0.04  # Default fallback 

def months_to_fye(last_fiscal, next_fiscal):
    try:
        current_time = datetime.now().timestamp()
        if current_time < next_fiscal:
            fiscal_end = datetime.fromtimestamp(next_fiscal)
        else:
            fiscal_end = datetime.fromtimestamp(last_fiscal)
        
        current_date = datetime.now()
        months_remaining = (fiscal_end.year - current_date.year) * 12 + (fiscal_end.month - current_date.month)
        return months_remaining if months_remaining >= 0 else 0
    except Exception as e:
        return None

def parse_earnings_forecast(forecast_df):
    """Parses the earnings forecast dataframe to extract fy1 and fy2 values."""
    try:
        fy0 = None
        fy1_avg = None
        fy2_avg = None

        if isinstance(forecast_df, pd.DataFrame):
            if 'avg' in forecast_df.columns:
                fy1_row = forecast_df.loc[forecast_df.index == '0y']
                fy2_row = forecast_df.loc[forecast_df.index == '+1y']
                
                fy1_avg = fy1_row['avg'].values[0] if not fy1_row.empty else None
                fy2_avg = fy2_row['avg'].values[0] if not fy2_row.empty else None

            if 'yearAgoEps' in forecast_df.columns:
                fy1_row = forecast_df.loc[forecast_df.index == '0y']
                fy0 = fy1_row['yearAgoEps'].values[0] if not fy1_row.empty else None
        
        return fy0, fy1_avg, fy2_avg
    except Exception:
        return None, None, None

def get_stock_data(ticker):
    stock_data = {}

    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        if info.get('shortName') == None:
            stock_data["error"] = "Invalid Ticker"
            return stock_data

        # Prepare Ticker Context Output
        stock_data["name"] = info.get('shortName')
        stock_data["website"] = info.get('website')
        stock_data["industry"] = info.get('industry')
        stock_data["sector"] = info.get('sector')

        balance_sheet = stock.balance_sheet
        forecast = stock.get_earnings_estimate()

        fy0, fy1, fy2 = parse_earnings_forecast(forecast)
        if fy0 is None:
            stock_data["error"] = "Earnings Forecast Unavailable"
            return stock_data

        # TODO: Make fy1/fy2 optional (need to implement functionality on frontend)

        last_fiscal = info.get("lastFiscalYearEnd")
        next_fiscal = info.get("nextFiscalYearEnd")
        book_value = info.get("bookValue")
        current_price = info.get("currentPrice")
        shares = info.get("sharesOutstanding")
        debt = balance_sheet.loc["Total Debt", :].iloc[0] if "Total Debt" in balance_sheet.index else None
        cash = balance_sheet.loc["Cash And Cash Equivalents", :].iloc[0] if "Cash And Cash Equivalents" in balance_sheet.index else None
        risk_free_rate = get_risk_free_rate()
        beta = info.get("beta")

        # TODO: Proper error messages if above fields are not properly intialized

        # Optional Fields
        payout_ratio = info.get("payoutRatio", 0)
        forward_dividend_rate = info.get("dividendRate", 0)
        trailing_dividend_rate = info.get("trailingAnnualDividendRate", 0)

        # Prepare Financial Statistics Output
        stock_data["eps_growth"] = EPS_GROWTH
        stock_data["risk_premium"] = RISK_PREMIUM
        stock_data["fy0"] = round(fy0, 2)
        stock_data["fy1"] = round(fy1, 2)
        stock_data["fy2"] = round(fy2, 2)
        stock_data["monthsToFYE"] = months_to_fye(last_fiscal, next_fiscal)
        stock_data["payout_ratio"] = round(payout_ratio, 2)
        stock_data["forward_dividend_rate"] = forward_dividend_rate
        stock_data["trailing_dividend_rate"] = trailing_dividend_rate
        stock_data["book_value"] = round(book_value, 2)
        stock_data["stock_price"] = round(current_price, 2)
        stock_data["shares"] = shares
        stock_data["debt"] = debt
        stock_data["cash"] = cash
        stock_data["beta"] = round(beta, 2)
        stock_data["risk_free_rate"] = round(risk_free_rate, 4)
        return stock_data

    except Exception as e:
        return {"error": str(e)}

@app.route("/api/stock", methods=["GET"])
def stock_handler():
    ticker = request.args.get("ticker")
    if not ticker:
        return jsonify({"error": "Ticker parameter is required"}), 400

    result = get_stock_data(ticker)
    return jsonify(result)

# Point to React Frontend
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
