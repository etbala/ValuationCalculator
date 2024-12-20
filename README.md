![Deploy Status](https://github.com/etbala/ValuationCalculator/actions/workflows/deploy.yml/badge.svg?branch=main)
![Site Status](https://img.shields.io/website-up-down-green-red/https/sharingval.com.svg)
[![Visit sharingval.com](https://img.shields.io/badge/Visit-sharingval.com-blue)](https://sharingval.com)


# Equity & Firm Valuation Calculator

The Equity & Firm Valuation Calculator is an educational tool designed to simplify the concepts of the Capital Asset Pricing Model (CAPM). 
By entering a publicly traded stock ticker, detailed financial data is retrieved from the Yahoo Finance API. The application computes the 
intrinsic value of a stock and calculates its implied cost of capital. Additionally, financial parameters can be adjusted to evaluate how 
changes affect the overall valuation, making it ideal for those seeking a deeper understanding of equity analysis.

## Running Locally

Follow these instructions to set up and run the project locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-repository-link.git
   cd equity-firm-valuation-calculator
   ```

2. **Build the Docker Image:**
   ```bash
   docker build -t valuation-calculator .
   ```

3. **Run the Docker Container:**
   ```bash
   docker run -p 5000:5000 valuation-calculator
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:5000`.

