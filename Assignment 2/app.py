from flask import Flask, jsonify, request, send_file
import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():   
    return send_file('./templates/index.html')

FINNHUB_API_KEY = 'cn970v9r01qoee99qev0cn970v9r01qoee99qevg'
POLYGON_API_KEY = 'HBp4N5C5bsRuA9F3iLdmlRZKAwhXJOd8'

@app.route('/company', methods=['GET'])
def get_company():
    symbol = request.args.get('symbol')
    api_endpoint = f"https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={FINNHUB_API_KEY}"
    res = requests.get(api_endpoint)
    response = res.json()
    return jsonify(response), 200

@app.route('/stock_summary', methods=['GET'])
def stock_summary():
    symbol = request.args.get('symbol')
    api_endpoint = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}"
    res = requests.get(api_endpoint)
    response = res.json()
    return jsonify(response), 200

@app.route('/stock_summary/recommendation', methods=['GET'])
def stock_summary_recommendation():
    symbol = request.args.get('symbol')
    api_endpoint = f"https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&token={FINNHUB_API_KEY}"
    res = requests.get(api_endpoint)
    response = res.json()
    return jsonify(response), 200

@app.route('/historydata', methods=['GET'])
def get_historydata():
    symbol = request.args.get('symbol')
    today = datetime.today().date()
    delta = today - relativedelta(months=6, days=1)
    api_endpoint = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{delta}/{today}?adjusted=true&sort=asc&apikey={POLYGON_API_KEY}"
    res = requests.get(api_endpoint)
    response = res.json()           
    return jsonify(response), 200


@app.route('/latest_news', methods=['GET'])
def get_latestnews():
    symbol = request.args.get('symbol')
    current_date = datetime.now().strftime('%Y-%m-%d')
    from_date = (datetime.now() - relativedelta(days=30)).strftime('%Y-%m-%d')
    api_endpoint = f'https://finnhub.io/api/v1/company-news?symbol={symbol}&from={from_date}&to={current_date}&token={FINNHUB_API_KEY}'
    res = requests.get(api_endpoint)
    response = res.json()
    return jsonify(response), 200


