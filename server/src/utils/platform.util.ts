// import puppeteer from 'puppeteer';

export const detectPlatform = (url: string): string | null => {
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('tiktok.com')) return 'tiktok';
    if (u.includes('instagram.com')) return 'instagram';
    if (u.includes('facebook.com')) return 'facebook';
    if (u.includes('x.com') || u.includes('twitter.com')) return 'twitter';
    return null;
};

export const extractYouTubeVideoId = (url: string): string | null => {
    const match =
        url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return match?.[1] || null;
};

export const extractFacebookVideoId = (url: string): string | null => {
    // Supports URLs like /videos/{id}, /watch/?v={id}, or /posts/{id}
    const match =
        url.match(/(?:\/videos\/|\/watch\/?\?v=|\/posts\/)(\d+)/);
    return match?.[1] || null;
};

export const extractTweetId = (url: string): string | null => {
    const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?\w+\/status\/(\d+)/);
    return match?.[1] || null;
};

export const getTextContaining = (html: string, label: string): string => {
    const regex = new RegExp(`${label}:?\\s*(\\d+[.,\\d]*\\s*[KM]?)`, 'i');
    const match = html.match(regex);
    return match ? match[1] : '0';
};

export const extractNumberFromText = (text: string): number => {
    const match = text.replace(/,/g, '').match(/(\d+(\.\d+)?)([KM]?)\b/i);
    if (!match) return 0;

    let [, num, , suffix] = match;
    const value = parseFloat(num);

    switch (suffix?.toUpperCase()) {
        case 'K':
            return Math.round(value * 1000);
        case 'M':
            return Math.round(value * 1000000);
        default:
            return Math.round(value);
    }
};

export const isTokenExpired = (expiry: Date): boolean => {
    return new Date() >= new Date(expiry);
};


// export const scrapeTweetWithPuppeteer = async (url: string) => {
//     let browser;
//     try {
//         browser = await puppeteer.launch({
//             headless: 'new', // More stable mode
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-dev-shm-usage',
//                 '--disable-gpu',
//                 '--no-zygote',
//                 '--single-process',
//             ],
//             timeout: 10000,
//         });

//         const page = await browser.newPage();
//         await page.goto(url, {
//             waitUntil: 'networkidle2',
//             timeout: 15000,
//         });

//         // Wait for the metrics buttons to appear
//         await page.waitForSelector('[data-testid="like"]', { timeout: 7000 });

//         const metrics = await page.evaluate(() => {
//             const getText = (selector: string) => {
//                 const el = document.querySelector(selector);
//                 return el?.textContent?.replace(/[^\dKM]/gi, '').trim() || '0';
//             };

//             return {
//                 likes: getText('[data-testid="like"]'),
//                 retweets: getText('[data-testid="retweet"]'),
//                 replies: getText('[data-testid="reply"]'),
//             };
//         });

//         const convertToNumber = (value: string): number => {
//             const match = value.match(/(\d+(\.\d+)?)([KM]?)/i);
//             if (!match) return 0;
//             const [, num, , suffix] = match;
//             const base = parseFloat(num);
//             switch (suffix?.toUpperCase()) {
//                 case 'K': return Math.round(base * 1000);
//                 case 'M': return Math.round(base * 1000000);
//                 default: return Math.round(base);
//             }
//         };

//         const postId = extractTweetId(url);

//         return {
//             platform: 'twitter',
//             postId,
//             metrics: {
//                 likes: convertToNumber(metrics.likes),
//                 retweets: convertToNumber(metrics.retweets),
//                 replies: convertToNumber(metrics.replies),
//             },
//             note: '✅ Puppeteer scraping fallback.',
//         };
//     } catch (error: any) {
//         console.error('Puppeteer error:', error.message);
//         throw new Error('Puppeteer scraping failed');
//     } finally {
//         if (browser) await browser.close();
//     }
// };

