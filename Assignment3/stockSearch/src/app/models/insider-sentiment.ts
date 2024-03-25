interface SentimentData {
    symbol: string;
    year: number;
    month: number;
    change: number;
    mspr: number;
  }
  
  interface Sentiment {
    data: SentimentData[];
    symbol: string;
  }
  
  interface MsprAggregates {
    totalMspr: number;
    positiveMspr: number;
    negativeMspr: number;
  }
  interface SentimentResponse {
    sentiment: Sentiment;
    msprAggregates: MsprAggregates;
  }