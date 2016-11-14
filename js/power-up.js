/* global TrelloPowerUp */

var hnrx = /https:\/\/news\.ycombinator\.com\/item\?id=(\d+)/;

function hnApiLink(id) {
  return 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json';
}

function hnApiFetch(id) {
  return fetch(hnApiLink(id))
    .then(function(response) {
      return response.json();
    });
}

TrelloPowerUp.initialize({
  // dropping a Hacker News link on an Add Card button
  // sets the title and description
  'card-from-url': function(t, options) {
    var match = hnrx.exec(options.url);
    if (match && match[1]) {
      return hnApiFetch(match[1])
        .then(function(json) {
          // this is an error
          // trying to attach a second link for the story itself
          //t.attach({ url: json.url, name: json.title });
          return {
            name: json.title + ' posted by ' + json.by,
            desc: 'Story link: ' + json.url + '\r\nHacker News link: ' + options.url
          };
        });
    } else {
      throw t.NotHandled();
    }
  },
  // Hacker News articles get a badge with score and comments
  'card-badges': function(t, card) {
    return {
      dynamic: function() {
        //console.log(new Date(), 'dynamic was called');
        return t.card('desc')
          .then(function(c) {
            //console.log(c);
            var match = hnrx.exec(c.desc);
            if (match && match[1]) {
              return hnApiFetch(match[1]);
            } else {
              //console.log('not handled');
              throw t.NotHandled();
            }
          })
          .then(function(json) {
            //console.log(json);
            var scoreColor = 'red';
            if (json.score > 100) scoreColor = 'yellow';
            if (json.score > 200) scoreColor = 'green';
            // randomly selected prime refresh time
            var refreshes = [47,59,61,67];
            // not possible to return multiple dynamic badges?
            return {
              text: 'Score: ' + json.score + ' Comments: ' + (json.descendants || 0),
              color: scoreColor,
              refresh: refreshes[Math.floor(Math.random() * refreshes.length)]
            };
          });
      }
    };
  },
  // format Hacker News links with an icon
  'format-url': function(t, options) {
    var match = hnrx.exec(options.url);
    if (match && match[1]) {
      return {
        text: match[1],
        icon: './images/hn-icon.png'
      }
    } else {
      throw t.NotHandled();
    }
  }
});
