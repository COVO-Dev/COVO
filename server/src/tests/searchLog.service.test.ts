import { SearchLogService } from '../services/searchLog.service';
import { Influencer } from '../models/influencers.models';
import { Instagram } from '../models/instagram.model';
import { Youtube } from '../models/youtube.model';
import { Facebook } from '../models/facebook.model';
import { Twitter } from '../models/twitter.model';
import { SearchLog } from '../models/searchLog.models';

jest.mock('../models/influencers.models');
jest.mock('../models/instagram.model');
jest.mock('../models/youtube.model');
jest.mock('../models/facebook.model');
jest.mock('../models/twitter.model');
jest.mock('../models/searchLog.models');

describe('SearchLogService', () => {
  let service: SearchLogService;

  beforeEach(() => {
    service = new SearchLogService();
    jest.clearAllMocks();
  });

  const mockInfluencers = [
    { _id: 'inf1', toObject: () => ({ _id: 'inf1', name: 'Alice' }) },
    { _id: 'inf2', toObject: () => ({ _id: 'inf2', name: 'Bob' }) },
  ];

  const mockPlatformData = [
    { influencerId: 'inf1', metrics: { followers: 1000 }, demographics: { age: 25 }, peakEngegement: { engagement: 5 } },
    { influencerId: 'inf2', metrics: { followers: 2000 }, demographics: { age: 30 }, peakEngegement: { engagement: 10 } },
  ];

  describe('searchInfluencers', () => {
    it('returns no influencers found if none match', async () => {
      (Influencer.find as jest.Mock).mockResolvedValueOnce([]);
      const response = await service.searchInfluencers('brand1', {});
      expect(response).toEqual({ status_code: 200, message: 'No influencers found', data: [] });
      expect(SearchLog.prototype.save).not.toHaveBeenCalled();
    });

    it('searches influencers and platform data with no platform filter', async () => {
      (Influencer.find as jest.Mock).mockResolvedValueOnce(mockInfluencers);
      (Instagram.find as jest.Mock).mockResolvedValueOnce([mockPlatformData[0]]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([mockPlatformData[1]]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      const filters = {};
      const result = await service.searchInfluencers('brand1', filters);

      expect(Influencer.find).toHaveBeenCalled();
      expect(Instagram.find).toHaveBeenCalled();
      expect(Youtube.find).toHaveBeenCalled();
      expect(Facebook.find).toHaveBeenCalled();
      expect(Twitter.find).toHaveBeenCalled();

      expect(SearchLog.prototype.save).toHaveBeenCalled();
      expect(result.status_code).toBe(200);
      expect(result.data.length).toBe(2);
    expect(result.data.map((d: { name: string }) => d.name)).toEqual(expect.arrayContaining(['Alice', 'Bob']));
      expect(result.data[0].platformData).toEqual(mockPlatformData[0]);
    });

    it('applies location filter', async () => {
      (Influencer.find as jest.Mock).mockImplementationOnce((query) => {
        expect(query['location.country']).toBe('USA');
        expect(query['location.city']).toBe('NYC');
        return Promise.resolve(mockInfluencers);
      });
      (Instagram.find as jest.Mock).mockResolvedValueOnce([]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      await service.searchInfluencers('brand1', { location: { country: 'USA', city: 'NYC' } });
    });

    it('applies age filter', async () => {
      (Influencer.find as jest.Mock).mockImplementationOnce((query) => {
        expect(query.age).toEqual({ $gte: 18, $lte: 30 });
        return Promise.resolve(mockInfluencers);
      });
      (Instagram.find as jest.Mock).mockResolvedValueOnce([]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      await service.searchInfluencers('brand1', { age: { min: 18, max: 30 } });
    });

    it('applies gender filter', async () => {
      (Influencer.find as jest.Mock).mockImplementationOnce((query) => {
        expect(query.gender).toEqual({ $in: ['male', 'female'] });
        return Promise.resolve(mockInfluencers);
      });
      (Instagram.find as jest.Mock).mockResolvedValueOnce([]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      await service.searchInfluencers('brand1', { gender: ['male', 'female'] });
    });

    it('applies interestCategories with $or query', async () => {
      (Influencer.find as jest.Mock).mockImplementationOnce((query) => {
        expect(query.$or).toEqual([
          { 'contentAndAudience.primaryNiche': { $in: ['fitness', 'fashion'] } },
          { 'contentAndAudience.secondaryNiche': { $in: ['fitness', 'fashion'] } },
        ]);
        return Promise.resolve(mockInfluencers);
      });
      (Instagram.find as jest.Mock).mockResolvedValueOnce([]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      await service.searchInfluencers('brand1', { interestCategories: ['fitness', 'fashion'] });
    });

    it('applies primaryNiche and secondaryNiche filters', async () => {
      (Influencer.find as jest.Mock).mockImplementationOnce((query) => {
        expect(query['contentAndAudience.primaryNiche']).toBe('tech');
        expect(query['contentAndAudience.secondaryNiche']).toBe('gaming');
        return Promise.resolve(mockInfluencers);
      });
      (Instagram.find as jest.Mock).mockResolvedValueOnce([]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      await service.searchInfluencers('brand1', { primaryNiche: 'tech', secondaryNiche: 'gaming' });
    });

    it('searches on a specific valid platform', async () => {
      (Influencer.find as jest.Mock).mockResolvedValueOnce(mockInfluencers);
      (Youtube.find as jest.Mock).mockResolvedValueOnce(mockPlatformData);
      (Instagram.find as jest.Mock).mockResolvedValueOnce([]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      const filters = { platform: 'youtube' };
      const result = await service.searchInfluencers('brand1', filters);

      expect(Youtube.find).toHaveBeenCalled();
      expect(result.data.length).toBe(2);
      expect(result.data[0].platformData).toEqual(mockPlatformData[0]);
    });

    it('searches all platforms when platform = all', async () => {
      (Influencer.find as jest.Mock).mockResolvedValueOnce(mockInfluencers);
      (Instagram.find as jest.Mock).mockResolvedValueOnce([mockPlatformData[0]]);
      (Youtube.find as jest.Mock).mockResolvedValueOnce([mockPlatformData[1]]);
      (Facebook.find as jest.Mock).mockResolvedValueOnce([]);
      (Twitter.find as jest.Mock).mockResolvedValueOnce([]);

      const filters = { platform: 'all' };
      const result = await service.searchInfluencers('brand1', filters);

      expect(Instagram.find).toHaveBeenCalled();
      expect(Youtube.find).toHaveBeenCalled();
      expect(Facebook.find).toHaveBeenCalled();
      expect(Twitter.find).toHaveBeenCalled();
      expect(result.data.length).toBe(2);
    });

    it('throws error on invalid platform', async () => {
      (Influencer.find as jest.Mock).mockResolvedValueOnce(mockInfluencers);

      await expect(service.searchInfluencers('brand1', { platform: 'invalid' })).rejects.toThrow('Invalid platform specified');
    });

    it('throws error when Influencer.find fails', async () => {
      (Influencer.find as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      await expect(service.searchInfluencers('brand1', {})).rejects.toThrow('Error while searching influencers: DB failure');
    });

    // it('throws error when platform model find fails', async () => {
    //   (Influencer.find as jest.Mock).mockResolvedValueOnce(mockInfluencers);
    //   (Instagram.find as jest.Mock).mockRejectedValueOnce(new Error('Platform DB error'));

    //   await expect(service.searchInfluencers('brand1', { platform: 'instagram' })).rejects.toThrow('Error while searching influencers: Platform DB error');
    // });
  });
});
