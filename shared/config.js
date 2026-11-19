/* Event settings for The AI Blind Spot. This is the only file to edit on the way to event day.
   Every page loads it before shared/common.js. */
window.BS_CONFIG = {
  /* Shared leaderboard (Supabase). Leave both empty and scores stay on each device, as in the prototype.
     Fill both in (Supabase dashboard → Project Settings → API) and every phone, tablet and the TV share one leaderboard.
     The key is the project's public "anon" (publishable) key. It is meant to be in the browser: the database's
     row-level security (supabase/schema.sql) only lets it read scores and add new ones. Never put the service_role key here. */
  supabaseUrl: '',
  supabaseKey: '',

  /* Where the QR codes point. */
  playUrl: 'https://mithya-team.github.io/ai-blind-spot/',

  /* Event day: set to false to hide "Not you?", so a phone can't switch to a new name for extra attempts. */
  allowSwitchPlayer: true,

  /* Prizes, shown on the leaderboard (phone, desktop and the TV). Places 1 to 3 are for the Overall leaderboard.
     img is optional: a path such as 'prizes/whoop.jpg'. Without one, a drawn icon is shown. */
  prizes: [
    { place: 1, label: '1st overall', title: 'Meta Ray-Ban glasses or a TUMI backpack', icon: 'glasses', img: '' },
    { place: 2, label: '2nd overall', title: 'WHOOP band with a 1-year membership', icon: 'band', img: '' },
    { place: 3, label: '3rd overall', title: 'LARQ self-cleaning bottle', icon: 'bottle', img: '' },
    { place: 0, label: 'Everyone who plays', title: 'Aviator socks', icon: 'socks', img: '' },
  ],
};
