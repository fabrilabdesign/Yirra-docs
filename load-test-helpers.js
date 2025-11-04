/**
 * Artillery Load Test Helpers
 * Helper functions for the Magic Sauce load testing scenarios
 */

module.exports = {
  // Generate random vote direction
  randomVoteDirection: function() {
    const directions = ['up', 'down'];
    return directions[Math.floor(Math.random() * directions.length)];
  },

  // Generate random user search terms
  randomUserSearch: function() {
    const searches = ['test', 'user', 'admin', 'bot', 'automation', ''];
    return searches[Math.floor(Math.random() * searches.length)];
  },

  // Generate random integer within range
  randomInt: function(min, max) {
    if (typeof min === 'undefined') {
      min = 1;
    }
    if (typeof max === 'undefined') {
      max = 100;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate random subreddit name
  randomSubreddit: function() {
    const subreddits = ['technology', 'programming', 'webdev', 'javascript', 'react', 'node', 'api', 'testing'];
    return subreddits[Math.floor(Math.random() * subreddits.length)];
  },

  // Generate random post title
  randomPostTitle: function() {
    const titles = [
      'Interesting discussion about technology',
      'Help with coding problem',
      'New framework release',
      'Best practices for development',
      'Performance optimization tips',
      'API design patterns',
      'Testing strategies',
      'Deployment automation'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  },

  // Generate random target ID (Reddit post/comment format)
  randomTargetId: function() {
    const prefixes = ['t3_', 't1_']; // t3 = post, t1 = comment
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const id = Math.random().toString(36).substring(2, 10);
    return prefix + id;
  },

  // Set up custom metrics
  setupCustomMetrics: function(requestParams, context, events, next) {
    // Track custom metrics
    events.on('request', (requestInfo) => {
      // Could add custom metrics here
    });

    return next();
  },

  // Validate response times
  validateResponseTime: function(requestParams, response, context, events, next) {
    const responseTime = response.timings.phases.total;

    if (responseTime > 5000) {
      events.emit('counter', 'slow_responses', 1);
    }

    if (responseTime > 10000) {
      events.emit('counter', 'very_slow_responses', 1);
    }

    return next();
  },

  // Log errors for debugging
  logErrors: function(requestParams, response, context, events, next) {
    if (response.statusCode >= 400) {
      events.emit('counter', `errors_${response.statusCode}`, 1);
    }

    return next();
  }
};
