import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api.js';

function mockFetchOnce(response) {
  global.fetch = vi.fn().mockResolvedValue(response);
}

describe('api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on a successful request', async () => {
    mockFetchOnce({ ok: true, status: 200, json: () => Promise.resolve([{ id: 1, name: 'Ada' }]) });

    const result = await api.interviewers.list();

    expect(result).toEqual([{ id: 1, name: 'Ada' }]);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/interviewers'),
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
    );
  });

  it('returns null for a 204 No Content response', async () => {
    mockFetchOnce({ ok: true, status: 204 });

    const result = await api.interviewers.remove(1);

    expect(result).toBeNull();
  });

  it('throws with the response body when the request fails', async () => {
    mockFetchOnce({ ok: false, status: 400, text: () => Promise.resolve('Bad request') });

    await expect(api.candidates.list()).rejects.toThrow('Bad request');
  });

  it('sends multipart form data without a Content-Type header for CSV import', async () => {
    mockFetchOnce({ ok: true, status: 200, json: () => Promise.resolve([]) });
    const file = new File(['name,stack'], 'interviewers.csv', { type: 'text/csv' });

    await api.interviewers.importCsv(file);

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
  });
});
