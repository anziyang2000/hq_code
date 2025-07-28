declare namespace DIGITAL_TICKETS {
  type PageParams = {
    page_no?: number;
    page_size?: number;
  };

  type BatchParams = {
    batch_id: string;
    page_no?: number;
    page_size?: number;
  };

  type HashParams = {
    tx_id: string;
    page_no?: number;
    page_size?: number;
  };

  type BlockchainAccount = {
    blockchain_account: string;
    page_no?: number;
    page_size?: number;
  };

  type TokenParams = {
    token_id: string;
    page_no?: number;
    page_size?: number;
  };

}
