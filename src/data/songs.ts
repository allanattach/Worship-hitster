import type { Song } from '../types'

/**
 * Curated pool of Christian songs across eras and genres: hymns, gospel,
 * CCM, modern worship, Christian rock and pop. Years reflect original
 * writing/release year, giving the timeline gameplay a wide spread.
 */
export const SONGS: Song[] = [
  // Hymns
  { id: 'mighty-fortress', title: 'A Mighty Fortress Is Our God', artist: 'Martin Luther', year: 1529, genre: 'hymn' },
  { id: 'joy-to-the-world', title: 'Joy to the World', artist: 'Isaac Watts', year: 1719, genre: 'hymn' },
  { id: 'come-thou-fount', title: 'Come Thou Fount of Every Blessing', artist: 'Robert Robinson', year: 1758, genre: 'hymn' },
  { id: 'amazing-grace', title: 'Amazing Grace', artist: 'John Newton', year: 1779, genre: 'hymn' },
  { id: 'o-come-all-ye-faithful', title: 'O Come, All Ye Faithful', artist: 'John Francis Wade', year: 1841, genre: 'hymn' },
  { id: 'holy-holy-holy', title: 'Holy, Holy, Holy', artist: 'Reginald Heber', year: 1826, genre: 'hymn' },
  { id: 'what-a-friend', title: 'What a Friend We Have in Jesus', artist: 'Joseph Scriven', year: 1855, genre: 'hymn' },
  { id: 'it-is-well', title: 'It Is Well with My Soul', artist: 'Horatio Spafford', year: 1876, genre: 'hymn' },
  { id: 'blessed-assurance', title: 'Blessed Assurance', artist: 'Fanny Crosby', year: 1873, genre: 'hymn' },
  { id: 'be-thou-my-vision', title: 'Be Thou My Vision', artist: 'Eleanor Hull', year: 1912, genre: 'hymn' },
  { id: 'in-the-garden', title: 'In the Garden', artist: 'C. Austin Miles', year: 1912, genre: 'hymn' },
  { id: 'turn-your-eyes', title: 'Turn Your Eyes Upon Jesus', artist: 'Helen Lemmel', year: 1922, genre: 'hymn' },
  { id: 'great-is-thy-faithfulness', title: 'Great Is Thy Faithfulness', artist: 'Thomas Chisholm', year: 1923, genre: 'hymn' },
  { id: 'how-great-thou-art', title: 'How Great Thou Art', artist: 'Stuart K. Hine', year: 1949, genre: 'hymn' },

  // Gospel
  { id: 'ill-fly-away', title: "I'll Fly Away", artist: 'Albert E. Brumley', year: 1929, genre: 'gospel' },
  { id: 'victory-in-jesus', title: 'Victory in Jesus', artist: 'E. M. Bartlett', year: 1939, genre: 'gospel' },
  { id: 'oh-happy-day', title: 'Oh Happy Day', artist: 'Edwin Hawkins Singers', year: 1968, genre: 'gospel' },
  { id: 'take-my-hand', title: 'Take My Hand, Precious Lord', artist: 'Thomas A. Dorsey', year: 1932, genre: 'gospel' },
  { id: 'total-praise', title: 'Total Praise', artist: 'Richard Smallwood', year: 1996, genre: 'gospel' },
  { id: 'i-smile', title: 'I Smile', artist: 'Kirk Franklin', year: 2011, genre: 'gospel' },
  { id: 'break-every-chain', title: 'Break Every Chain', artist: 'Tasha Cobbs', year: 2013, genre: 'gospel' },

  // CCM (70s-90s)
  { id: 'friends', title: 'Friends', artist: 'Michael W. Smith', year: 1982, genre: 'ccm' },
  { id: 'el-shaddai', title: 'El Shaddai', artist: 'Amy Grant', year: 1982, genre: 'ccm' },
  { id: 'thy-word', title: 'Thy Word', artist: 'Amy Grant', year: 1984, genre: 'ccm' },
  { id: 'place-in-this-world', title: 'Place in This World', artist: 'Michael W. Smith', year: 1990, genre: 'ccm' },
  { id: 'baby-baby', title: 'Baby Baby', artist: 'Amy Grant', year: 1991, genre: 'pop' },
  { id: 'jesus-freak', title: 'Jesus Freak', artist: 'DC Talk', year: 1995, genre: 'ccm' },
  { id: 'his-strength-is-perfect', title: 'His Strength Is Perfect', artist: 'Steven Curtis Chapman', year: 1988, genre: 'ccm' },
  { id: 'dive', title: 'Dive', artist: 'Steven Curtis Chapman', year: 1999, genre: 'ccm' },
  { id: 'live-out-loud', title: 'Live Out Loud', artist: 'Steven Curtis Chapman', year: 1999, genre: 'ccm' },
  { id: 'flood', title: 'Flood', artist: 'Jars of Clay', year: 1995, genre: 'ccm' },
  { id: 'god-of-wonders', title: 'God of Wonders', artist: 'Third Day', year: 2000, genre: 'worship' },
  { id: 'i-can-only-imagine', title: 'I Can Only Imagine', artist: 'MercyMe', year: 2001, genre: 'ccm' },
  { id: 'word-of-god-speak', title: 'Word of God Speak', artist: 'MercyMe', year: 2002, genre: 'ccm' },

  // Christian rock
  { id: 'dare-you-to-move', title: 'Dare You to Move', artist: 'Switchfoot', year: 2003, genre: 'rock' },
  { id: 'meant-to-live', title: 'Meant to Live', artist: 'Switchfoot', year: 2003, genre: 'rock' },
  { id: 'cry-out-to-jesus', title: 'Cry Out to Jesus', artist: 'Third Day', year: 2005, genre: 'rock' },
  { id: 'hero', title: 'Hero', artist: 'Skillet', year: 2009, genre: 'rock' },
  { id: 'awake-and-alive', title: 'Awake and Alive', artist: 'Skillet', year: 2009, genre: 'rock' },
  { id: 'monster', title: 'Monster', artist: 'Skillet', year: 2009, genre: 'rock' },
  { id: 'feel-invincible', title: 'Feel Invincible', artist: 'Skillet', year: 2016, genre: 'rock' },
  { id: 'flawless', title: 'Flawless', artist: 'MercyMe', year: 2016, genre: 'ccm' },

  // Worship classics
  { id: 'shout-to-the-lord', title: 'Shout to the Lord', artist: 'Darlene Zschech', year: 1993, genre: 'worship' },
  { id: 'here-i-am-to-worship', title: 'Here I Am to Worship', artist: 'Tim Hughes', year: 2000, genre: 'worship' },
  { id: 'blessed-be-your-name', title: 'Blessed Be Your Name', artist: 'Matt Redman', year: 2002, genre: 'worship' },
  { id: 'how-great-is-our-god', title: 'How Great Is Our God', artist: 'Chris Tomlin', year: 2004, genre: 'worship' },
  { id: 'indescribable', title: 'Indescribable', artist: 'Chris Tomlin', year: 2004, genre: 'worship' },
  { id: 'cornerstone', title: 'Cornerstone', artist: 'Hillsong Worship', year: 2012, genre: 'worship' },
  { id: 'our-god', title: 'Our God', artist: 'Chris Tomlin', year: 2010, genre: 'worship' },
  { id: '10000-reasons', title: '10,000 Reasons (Bless the Lord)', artist: 'Matt Redman', year: 2011, genre: 'worship' },
  { id: 'great-are-you-lord', title: 'Great Are You Lord', artist: 'All Sons & Daughters', year: 2013, genre: 'worship' },
  { id: 'whom-shall-i-fear', title: 'Whom Shall I Fear (God of Angel Armies)', artist: 'Chris Tomlin', year: 2013, genre: 'worship' },
  { id: 'oceans', title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong United', year: 2013, genre: 'worship' },
  { id: 'forever-we-sing-hallelujah', title: 'Forever (We Sing Hallelujah)', artist: 'Kari Jobe', year: 2014, genre: 'worship' },
  { id: 'holy-spirit', title: 'Holy Spirit', artist: 'Francesca Battistelli', year: 2014, genre: 'worship' },
  { id: 'good-good-father', title: 'Good Good Father', artist: 'Chris Tomlin', year: 2014, genre: 'worship' },
  { id: 'this-is-amazing-grace', title: 'This Is Amazing Grace', artist: 'Phil Wickham', year: 2013, genre: 'worship' },
  { id: 'way-maker', title: 'Way Maker', artist: 'Sinach', year: 2016, genre: 'worship' },
  { id: 'build-my-life', title: 'Build My Life', artist: 'Pat Barrett', year: 2016, genre: 'worship' },
  { id: 'what-a-beautiful-name', title: 'What a Beautiful Name', artist: 'Hillsong Worship', year: 2016, genre: 'worship' },
  { id: 'do-it-again', title: 'Do It Again', artist: 'Elevation Worship', year: 2017, genre: 'worship' },
  { id: 'reckless-love', title: 'Reckless Love', artist: 'Cory Asbury', year: 2017, genre: 'worship' },
  { id: 'who-you-say-i-am', title: 'Who You Say I Am', artist: 'Hillsong Worship', year: 2018, genre: 'worship' },
  { id: 'goodness-of-god', title: 'Goodness of God', artist: 'Bethel Music', year: 2018, genre: 'worship' },
  { id: 'living-hope', title: 'Living Hope', artist: 'Phil Wickham', year: 2018, genre: 'worship' },
  { id: 'graves-into-gardens', title: 'Graves into Gardens', artist: 'Elevation Worship', year: 2019, genre: 'worship' },
  { id: 'raise-a-hallelujah', title: 'Raise a Hallelujah', artist: 'Bethel Music', year: 2019, genre: 'worship' },
  { id: 'king-of-kings', title: 'King of Kings', artist: 'Hillsong Worship', year: 2019, genre: 'worship' },
  { id: 'see-a-victory', title: 'See a Victory', artist: 'Elevation Worship', year: 2019, genre: 'worship' },
  { id: 'the-blessing', title: 'The Blessing', artist: 'Kari Jobe & Elevation Worship', year: 2020, genre: 'worship' },
  { id: 'firm-foundation', title: "Firm Foundation (He Won't)", artist: 'Maverick City Music', year: 2020, genre: 'worship' },
  { id: 'jireh', title: 'Jireh', artist: 'Elevation Worship & Maverick City', year: 2021, genre: 'worship' },
  { id: 'holy-forever', title: 'Holy Forever', artist: 'Chris Tomlin', year: 2021, genre: 'worship' },
  { id: 'house-of-the-lord', title: 'House of the Lord', artist: 'Phil Wickham', year: 2021, genre: 'worship' },

  // Contemporary Christian pop / rock
  { id: 'who-am-i', title: 'Who Am I', artist: 'Casting Crowns', year: 2003, genre: 'ccm' },
  { id: 'voice-of-truth', title: 'Voice of Truth', artist: 'Casting Crowns', year: 2003, genre: 'ccm' },
  { id: 'praise-you-in-this-storm', title: 'Praise You in This Storm', artist: 'Casting Crowns', year: 2005, genre: 'ccm' },
  { id: 'east-to-west', title: 'East to West', artist: 'Casting Crowns', year: 2007, genre: 'ccm' },
  { id: 'just-be-held', title: 'Just Be Held', artist: 'Casting Crowns', year: 2014, genre: 'ccm' },
  { id: 'redeemed', title: 'Redeemed', artist: 'Big Daddy Weave', year: 2012, genre: 'ccm' },
  { id: 'my-story', title: 'My Story', artist: 'Big Daddy Weave', year: 2015, genre: 'ccm' },
  { id: 'overcomer', title: 'Overcomer', artist: 'Mandisa', year: 2013, genre: 'pop' },
  { id: 'blessings', title: 'Blessings', artist: 'Laura Story', year: 2011, genre: 'ccm' },
  { id: 'fear-is-a-liar', title: 'Fear Is a Liar', artist: 'Zach Williams', year: 2016, genre: 'ccm' },
  { id: 'chain-breaker', title: 'Chain Breaker', artist: 'Zach Williams', year: 2016, genre: 'ccm' },
  { id: 'old-church-choir', title: 'Old Church Choir', artist: 'Zach Williams', year: 2017, genre: 'ccm' },
  { id: 'even-if', title: 'Even If', artist: 'MercyMe', year: 2017, genre: 'ccm' },
  { id: 'rescue', title: 'Rescue', artist: 'Lauren Daigle', year: 2018, genre: 'pop' },
  { id: 'you-say', title: 'You Say', artist: 'Lauren Daigle', year: 2018, genre: 'pop' },
  { id: 'trust-in-you', title: 'Trust In You', artist: 'Lauren Daigle', year: 2015, genre: 'pop' },
  { id: 'thy-will', title: 'Thy Will', artist: 'Hillary Scott & The Scott Family', year: 2016, genre: 'pop' },
]

export function getSongById(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id)
}
