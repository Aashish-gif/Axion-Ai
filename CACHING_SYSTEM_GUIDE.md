# AI Report Caching System

## Overview
The YouTube analytics reports now use **intelligent caching** to persist AI-generated reports across page reloads. Reports are automatically regenerated only when video statistics change significantly.

## How It Works

### 🎯 Key Features

1. **Smart Cache Storage**
   - Reports are cached in MongoDB for **7 days**
   - Each report is linked to a specific user and video
   - Automatic expiration ensures fresh data

2. **Intelligent Cache Invalidation**
   The system checks for significant changes in video statistics:
   - **Views**: Regenerates if changed by ≥5%
   - **Comments**: Regenerates if changed by ≥5%
   - **Likes**: Regenerates if changed by ≥5%
   
   If changes are below these thresholds, the cached report is returned instantly.

3. **Dynamic Sentiment Scoring**
   Scores are calculated uniquely for each video based on:
   - **Comment Analysis**: Real-time sentiment from comment text
   - **Engagement Rate**: Like-to-view ratio bonus (up to +10 points)
   - **Positive/Negative Word Frequency**: Detailed text analysis
   - **Performance Metrics**: Views, likes, comments interaction

### 📊 Score Calculation Formula

```typescript
// When comments are available:
sentimentScore = 65 + (positiveCount / comments.length) * 35 + engagementBonus
// Where engagementBonus = min(10, engagementRate * 0.5)
// Final score capped between 40-99

// When comments API fails:
sentimentScore = 60 + (engagementRate * 100) + (commentCount % 15)
// Where engagementRate = (likes + comments) / views
```

## Technical Implementation

### Database Schema

**CachedReport Model** (`src/models/User.ts`):
```typescript
{
  userId: string;        // User identifier (indexed)
  videoId: string;       // YouTube video ID (indexed)
  reportData: any;       // Complete AI report object
  videoStatistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  expiresAt: Date;       // Cache expiration (7 days from creation)
  createdAt: Date;
}
```

### Cache Flow

```
User requests report
      ↓
Check for cached report
      ↓
┌─────────────────┐
│ Found in cache? │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ↓         ↓
Check stats  Generate new AI report
    ↓         │
Significant   ↓
change?    Store in cache
    │         │
 ┌──┴──┐      │
 │     │      │
YES   NO      │
 │     │      │
 ↓     ↓      ↓
Generate  Return cached
new report  report
    │         │
    └────┬────┘
         ↓
    Return report
```

## Console Output Examples

### Returning Cached Report
```
✓ Returning cached report for video dQw4w9WgXcQ (views: 2.3% change, comments: 1.8% change)
```

### Regenerating Report (Stats Changed)
```
📊 Stats changed significantly (views: 12.5%, comments: 8.3%), regenerating report...
💾 Cached report for video dQw4w9WgXcQ for 7 days
```

### First-Time Generation
```
💾 Cached report for video dQw4w9WgXcQ for 7 days
```

## Benefits

### Performance
- ⚡ **Faster load times**: Cached reports return instantly
- 📉 **Reduced API calls**: Fewer requests to YouTube/Google AI
- 💰 **Cost savings**: Less AI generation = lower costs

### User Experience
- 🔄 **Consistent data**: Same report on page reload
- 📊 **Historical snapshots**: See how reports change over time
- 🎯 **Smart updates**: Only regenerates when meaningful changes occur

## Edge Cases Handled

1. **Demo Videos**: Even demo videos (ID "1") are cached
2. **Missing Statistics**: Graceful fallbacks for missing view/like/comment counts
3. **Cache Expiration**: Automatic cleanup after 7 days
4. **Division by Zero**: Safe division with fallback values
5. **API Failures**: Fallback scoring when comments API unavailable

## Testing the Cache

### Test 1: Verify Caching Works
1. Load a video report
2. Note the sentiment score and console message
3. Reload the page
4. You should see: `✓ Returning cached report...`
5. Score should be identical

### Test 2: Force Cache Regeneration
1. Wait for stats to change naturally (wait for views/likes/comments to increase)
2. Or manually edit the cached report in MongoDB to have old stats
3. Load the report again
4. You should see: `📊 Stats changed significantly...`
5. New report generated and cached

### Test 3: Check MongoDB
```javascript
// In MongoDB Compass or shell:
db.cachedreports.find({ videoId: "YOUR_VIDEO_ID" }).pretty()
```

You should see documents with:
- Complete reportData object
- videoStatistics snapshot
- expiresAt date (7 days from creation)

## Configuration

### Cache Duration
Currently set to **7 days**. To change:

```typescript
// In src/app/api/youtube/report/[id]/route.ts line ~280
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // Change 7 to desired days
```

### Change Threshold
Currently set to **5%**. To adjust sensitivity:

```typescript
// In src/app/api/youtube/report/[id]/route.ts line ~107
if (viewChange < 0.05 && commentChange < 0.05 && likeChange < 0.05) {
  // Change 0.05 to desired threshold (e.g., 0.10 for 10%)
}
```

## Files Modified

1. **`src/app/api/youtube/report/[id]/route.ts`**
   - Added cache checking logic
   - Implemented change detection algorithm
   - Added MongoDB storage/retrieval

2. **`src/models/User.ts`**
   - Added ICachedReport interface
   - Added CachedReportSchema
   - Exported CachedReport model

3. **`src/app/api/youtube/videos/route.ts`**
   - Enhanced sentiment scoring with engagement bonuses
   - Made scores more dynamic per video

## Future Enhancements

Potential improvements for the caching system:

1. **Manual Cache Clear**: Add UI button to force regenerate reports
2. **Cache Analytics**: Track how often reports change vs stay cached
3. **Tiered Caching**: Different durations based on video age/performance
4. **Background Refresh**: Auto-regenerate when approaching expiration
5. **A/B Testing**: Compare cached vs fresh reports for accuracy

---

**Last Updated**: March 25, 2026  
**Version**: 1.0
