Claude
Network error: connection lost — Failed to fetch
Claude
Here are 6 new animated variants, all built directly on your gradient:

# Name What it does

01 Shimmer Sweep Light glint streaks across on hover
02 Breathing Glow Amber halo pulses slowly at rest, intensifies on hover
03 Spun Border Fine amber thread orbits the button continuously
04 Magnetic Tilt Button tilts toward your cursor in 3D
05 Living Gradient Gradient drifts slowly, quickens on hover
06 Tilt + Shimmer Combines 04 + 01 — most dynamic
Hover over each one to see the effect. Which direction feels right for the site's tone?

Verifier agent check completed
Claude
Which one(s) feel right? I can also combine effects, dial the intensity up or down, or try different label copy — "Keep This Archive Alive", "Help Us Remember", etc.

You
05 — Living Gradient looks nice, what is its code?
Claude
Here's the CSS for the Living Gradient button, translated to your Tailwind-compatible class structure:

CSS (vanilla):

background: linear-gradient(135deg,
hsl(222,47%,14%),
rgba(160,85,15,0.55),
hsl(215,40%,16%),
rgba(180,100,20,0.45),
hsl(222,47%,14%)
);
background-size: 300% 300%;
animation: grad-drift 6s ease infinite;

@keyframes grad-drift {
0% { background-position: 0% 50%; }
50% { background-position: 100% 50%; }
100% { background-position: 0% 50%; }
}

/_ on hover: _/
animation: grad-drift 1.8s ease infinite;

As a Tailwind + inline style hybrid (since Tailwind can't do animated background-position natively):

<style>{`
  @keyframes grad-drift {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  .btn-living      { animation: grad-drift 6s ease infinite; }
  .btn-living:hover { animation: grad-drift 1.8s ease infinite; }
`}</style>

<a
className="btn-living w-full mb-3 text-base font-medium py-2 px-4 rounded-lg text-center block shadow-lg border border-amber-700/35"
style={{
    background: 'linear-gradient(135deg, hsl(222,47%,14%), rgba(160,85,15,0.55), hsl(215,40%,16%), rgba(180,100,20,0.45), hsl(222,47%,14%))',
    backgroundSize: '300% 300%',
    color: 'hsl(34,60%,90%)',
  }}

> Support This Work
> </a>
