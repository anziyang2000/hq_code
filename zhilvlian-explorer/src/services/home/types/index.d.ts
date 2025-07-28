declare namespace HOME {
  type txByHour = {
    channel_genesis_hash?: string;
    days?: number;
    day_length?: number;
  };
  
  type txByMinute = {
    channel_genesis_hash?: string;
    hours?: number;
  };

  type blockActivity = {
    channel_genesis_hash: string;
  };
}
