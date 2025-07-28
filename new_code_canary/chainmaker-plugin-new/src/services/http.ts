interface HttpsRequest {
  method?: 'POST';
  url: string;
  data?: Record<string, any>;
  body?: string;
  contentTye?: string;
}

export const httpsRequest = <T>({
  method = 'POST',
  url,
  data,
  body,
  contentTye = 'application/json',
}: HttpsRequest): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader('content-type', contentTye);
      xhr.onerror = (err) => {
        console.error('onerror', err);
        reject(err);
      };
      xhr.onabort = (err) => {
        console.error('onerror', err);
        reject(err);
      };
      xhr.send(data ? JSON.stringify(data) : body);
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`xhr request failed,status:${xhr.status}`));
        }
      };
    } catch (error) {
      reject(error);
    }
  });
