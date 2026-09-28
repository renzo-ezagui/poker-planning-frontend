import { Link } from 'react-router-dom';

export function Help() {
  return (
    <div className="page">
      <header className="page-head">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span> Planning Poker
        </Link>
        <Link to="/admin" className="btn btn-sm">
          Host a table
        </Link>
      </header>

      <article className="manual">
        <div className="eyebrow">Manual</div>
        <h1>How Planning Poker works</h1>
        <p className="lede">
          Your team estimates a story by each picking a card in secret. When everyone has picked, the host
          flips all the cards at once, so nobody anchors on the first number said out loud.
        </p>

        <nav className="manual-toc" aria-label="Contents">
          <a href="#players">Joining as a player</a>
          <a href="#hosts">Hosting a table</a>
          <a href="#rounds">Running rounds</a>
          <a href="#moderation">Keeping the table tidy</a>
          <a href="#faq">Questions</a>
        </nav>

        <section id="players">
          <h2>Joining as a player</h2>
          <p>You don’t need an account.</p>
          <ol>
            <li>Open the invite link or scan the QR code the host shared. If you only have the 8-letter table code, type it on the home page.</li>
            <li>Enter your name and choose <b>Vote</b> (you’ll estimate) or <b>Watch</b> (you’ll see everything but won’t get cards).</li>
            <li>Press <b>Take a seat</b>. You’ll see the table with everyone who’s there.</li>
            <li>When the host starts a round, your cards appear at the bottom. Tap one to vote. Until the reveal you can change it as often as you like, and nobody sees your number.</li>
            <li>A green dot next to a name means that person has voted.</li>
          </ol>
          <p className="note">
            Closed the tab or lost your connection? Open the same link again on the same device and you’ll get your seat (and your vote) back.
          </p>
        </section>

        <section id="hosts">
          <h2>Hosting a table</h2>
          <p>Hosts need an account, because they’re the ones who open tables and run the rounds.</p>
          <h3>Create your account</h3>
          <ol>
            <li>Press <b>Host a table</b> (top right of the home page).</li>
            <li>Choose <b>Create account</b>, pick a username and a password of at least 12 characters, and you’re in. If the page shows a <b>Sign in with Google</b> button, you can use that instead and skip the password.</li>
            <li>Next time, use <b>Sign in</b> with the same username and password (or the same Google account). You stay signed in for 2 hours.</li>
          </ol>
          <p className="note">If there’s no <b>Create account</b> option, whoever runs this server has turned sign-ups off. Ask them for an account.</p>
          <h3>Open a table</h3>
          <ol>
            <li>Pick a deck: <b>Fibonacci</b> (0, 1, 2, 3, 5, 8, 13…) for story points, or <b>T-shirt</b> (XS–XL) for rough sizing. Both decks include <b>?</b> for “not sure”.</li>
            <li>
              Pick a theme: <b>Card room</b> (a classic felt table), <b>8-bit dungeon</b> (pixel art, torches,
              chiptune sounds) or <b>C:\&gt; Terminal</b> (MS-DOS style, with a vector table and F-key shortcuts:
              F2 reveal, F3 revote, F4 timer, F9 chat, F10 host controls). You can switch themes any time from{' '}
              <b>Host controls</b>, and everyone at the table sees the change instantly.
            </li>
            <li>Pick how long the table stays open (2, 8 or 24 hours). It closes by itself after that.</li>
            <li>Press <b>Open table</b>. Share the link or QR code however you like: chat, email, a slide.</li>
            <li>Press <b>Sit at table</b> and pick a name. You join like everyone else, but you also get the <b>Host controls</b> panel.</li>
          </ol>
        </section>

        <section id="rounds">
          <h2>Running rounds</h2>
          <ol>
            <li>Type what you’re estimating (“Checkout: saved cards”) in <b>Host controls</b> and press <b>Start</b>. Everyone’s cards appear.</li>
            <li>The <b>Reveal</b> button shows how many people have voted (e.g. 3/4). Want a deadline? Start a 30 s, 1 m or 2 m timer. It only chimes; it never reveals on its own.</li>
            <li>Press <b>Reveal</b>. All cards flip together, and the table shows the average, median, spread and how the votes were split. If everyone picked the same card, you’ll see <i>Consensus!</i></li>
            <li>Talk it through. Press <b>Revote</b> to vote on the same story again, or type the next story and press <b>Next</b>.</li>
            <li>When you’re done, press <b>End session</b>, then <b>Close for everyone</b>. Everyone gets a <b>Download CSV</b> button with every round, its stats and who voted what.</li>
          </ol>
          <p className="note">
            <b>?</b> votes don’t count towards the average. T-shirt sizes aren’t numbers, so you get the most-voted size instead of an average.
          </p>
        </section>

        <section id="moderation">
          <h2>Keeping the table tidy</h2>
          <p>As host, click anyone’s round token on the table to open their menu:</p>
          <ul>
            <li><b>Mute</b> stops them from writing in the chat (they can still vote). Click again to unmute.</li>
            <li><b>Kick</b> removes them from the table. They can come back with the link, so it’s a nudge, not a ban.</li>
            <li><b>Ban</b> removes them and blocks their network address from rejoining this table. Banned addresses show up at the bottom of <b>Host controls</b>, where you can <b>Unban</b> them.</li>
          </ul>
          <p className="note">
            A ban is by network address. People on the same office Wi-Fi often share one, so banning one of them can lock out the others too. Use Kick first.
          </p>
        </section>

        <section id="faq">
          <h2>Questions</h2>
          <dl>
            <dt>Can people see my vote before the reveal?</dt>
            <dd>No. The server doesn’t send anyone’s number until the host reveals. Others only see that you voted.</dd>
            <dt>What’s the chat for?</dt>
            <dd>Quick side comments during a round. It isn’t saved anywhere and disappears when the table closes.</dd>
            <dt>I opened the table in two tabs and one says I left.</dt>
            <dd>You can only sit in one place at a time. The newest tab takes the seat. Press <b>Rejoin</b> in the one you want to keep.</dd>
            <dt>“That name is already taken”?</dt>
            <dd>Someone at the table is already using it. Add an initial or a surname.</dd>
            <dt>Where did my table go?</dt>
            <dd>Tables close when the host ends them or when their time runs out. Hosts can see their open tables on the host page.</dd>
            <dt>Sounds?</dt>
            <dd>Cards make a small flip sound on reveal and the timer chimes. Use the speaker button at the top right to turn sounds off.</dd>
          </dl>
        </section>
      </article>
    </div>
  );
}
