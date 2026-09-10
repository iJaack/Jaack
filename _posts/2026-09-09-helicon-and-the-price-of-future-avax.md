---
title: "helicon and the price of future AVAX"
layout: post
image: /assets/research/helicon/cover.png
headerImage: true
date: 2026-09-09 09:00:00 +0200
permalink: /helicon-and-the-price-of-future-avax/
tag:
- research
- avalanche
- tokenomics
category: blog
author: jaack
description: "Ahead of Helicon, I compared ten tokens from 2020 to test whether future supply deserves a valuation discount, and what the evidence can say about slower AVAX issuance."
published: true
lang: en
custom_scripts:
- path: /assets/research/helicon/chart.js?v=1
  defer: true
custom_stylesheets:
- /assets/research/helicon/article.css?v=interactive1
---

I was discussing [Helicon’s proposed reduction in AVAX issuance](https://academy.avax.network/blog/helicon-upgrade), and my reaction was: yes, less dilution today may be good. But [AVAX has a max supply](https://docs.avax.network/docs/primary-network/avax-token). Slowing issuance also means leaving more tokens to enter circulation further into the future.

I called this the “pressure of the last token.” My concern is that investors may keep discounting AVAX while a substantial part of its supply remains ahead of them. They may prefer a token whose major releases have finished.

Issuing the remaining AVAX faster could make the price much worse in the meantime. My thesis is that, as circulating supply approaches max supply, investors could then accept a higher valuation because they have less future supply to worry about. I wanted to find evidence for that second part before treating it as a reason to oppose lower issuance.

Helicon is [scheduled for mainnet on 22 September 2026](https://github.com/ava-labs/avalanchego/releases/tag/v1.15.0). Alongside changes to staking and [C-Chain execution](https://academy.avax.network/docs/acps/194-continuous-execution), [ACP-285 lowers the minimum consumption-rate parameter](https://docs.avax.network/docs/acps/285-reduce-minimum-consumption-rate) from 10% to 7.5% over 90 days. The maximum stays unchanged. These are parameters in the staking reward formula. A staker’s yield also depends on the rest of that formula; a 2.5-point parameter cut does not mean a 2.5-point cut in token inflation. The authors project [0.5–1 percentage point less annual inflation](https://docs.avax.network/docs/acps/285-reduce-minimum-consumption-rate) under their modelling assumptions.[^7]

That leaves more of the finite reward budget available for later. I understand the argument for doing this: Avalanche can pay less in rewards now and sustain them for longer. My concern was whether investors would attach a cost to that longer distribution period.

I also wanted to compare tokens without a fixed cap. With ETH, for example, you don’t have a final token to wait for. You can adjust expectations around issuance and burns, then estimate net inflation over the period you plan to hold it. I thought that might make uncapped tokens easier to value, despite the absence of a supply limit.

I compared AVAX with BTC, ETH, SOL, APT, SUI, ADA, DOT, ATOM and NEAR, going back to 2020. I found results that supported my intuition, but I could reverse them by changing the starting date.

I’m writing this on 9 September 2026, before mainnet activation. The dataset ends on 6 September. None of the returns below measures Helicon’s effect.

I used [81 monthly snapshot dates](/assets/research/helicon/monthly-snapshots.csv), from 5 January 2020 to 6 September 2026, giving me 705 prices and 704 circulating-supply observations. AVAX enters the monthly sample in October 2020, APT in November 2022 and SUI in May 2023. Those are the first observations in this dataset, not their exact launch dates.[^1]

I kept CoinMarketCap as the historical source to avoid mixing providers’ [definitions of circulating supply](https://coinmarketcap.com/faq/). Even then, the numbers include more than new issuance: existing allocations can enter circulation, and the provider can change its classification. The first SOL price observation has no circulating-supply value, so I left that cell empty.

In the original discussion, I used “unlocked” to cover too many things. [Investor vesting](https://aptosnetwork.com/currents/aptos-tokenomics-overview), [new staking issuance](https://docs.avax.network/docs/primary-network/avax-token) and circulating supply measure different things. Vesting releases existing allocations; minting creates tokens. Burns reduce supply. Unstaking can make tokens liquid without creating any. [Staking APR](https://solana.com/staking) measures rewards relative to staked capital, which also makes it different from inflation across the whole supply.

For AVAX, the gap between reported circulation and 720M includes existing allocations outside circulation as well as tokens yet to be minted. Helicon changes staking rewards. It doesn’t reschedule that entire gap as one unlock.

I started with circulating supply divided by the supply ceiling. That gives me a percentage to compare, but it leaves out who receives the remaining tokens and when they receive them. I would expect different selling pressure from an allocation released next month and the same quantity issued over years.

The table uses [circulation on 6 September 2026](https://coinmarketcap.com/historical/20260906/) and a common return period, [7 May 2023 to 6 September 2026](/assets/research/helicon/long-horizon.csv). This lets me include APT and SUI without comparing them with years before they existed. Returns are in USD and exclude staking rewards.[^2]

| Token | Supply ceiling | Circulating / ceiling | Price return, common period |
|---|---:|---:|---:|
| [BTC](https://bitcoin.org/en/faq#how-are-bitcoins-created) | 21M | 95.6% | +182.4% |
| [ETH](https://ethereum.org/roadmap/merge/issuance/) | No fixed cap | N/A | +34.2% |
| [AVAX](https://docs.avax.network/docs/primary-network/avax-token) | 720M | 60.0% | −51.9% |
| [SOL](https://solana.com/staking) | No fixed cap | N/A | +387.3% |
| [APT](https://aptosnetwork.com/currents/aptos-tokenomics-update) | 2.1B approved* | 40.9%* | −93.2% |
| [SUI](https://www.sui.io/token-schedule) | 10B | 41.0% | −34.8% |
| [ADA](https://forum.cardano.org/t/max-lovelace-supply-cardano-network-parameters-part-18/144295) | 45B | 81.6% | −40.8% |
| [DOT](https://forum.polkadot.network/t/changes-on-polkadot-in-march-2026/17101) | 2.1B† | 81.0% | −82.7% |
| [ATOM](https://docs.cosmos.network/sdk/latest/modules/mint/README) | No fixed cap | N/A | −85.5% |
| [NEAR](https://docs.near.org/protocol/network/validators) | No fixed cap | N/A | +39.9% |

*[APT’s cap has approval](https://governance.aptosfoundation.org/proposal/183?votesPage=0), but I haven’t verified its subsequent protocol enforcement. Its ratio assumes that approved ceiling. †[DOT’s capped issuance schedule dates to 2026; governance approved the cap in 2025](https://forum.polkadot.network/t/changes-on-polkadot-in-march-2026/17101). I kept both in this table and excluded them from historical tests that need a consistent cap policy. For uncapped tokens, circulating/max is undefined.[^3]

I also avoided comparing circulating/max with market cap/FDV. If you calculate [market cap as price × circulating supply](https://coinmarketcap.com/faq/) and FDV as price × max supply, those two ratios are identical. A correlation between them would add nothing.

I compared the starting supply ratio with the price return that followed. That lets me test an implication of my thesis, but a price return alone can’t tell me how much of a valuation discount investors assigned to future supply.

For BTC, AVAX and ADA, I kept the September 2026 endpoint and [changed the starting date](/assets/research/helicon/reproduction.zip):

| Starting snapshot | Correlation with subsequent price return |
|---|---:|
| October 2020 | +0.71 |
| January 2021 | −0.16 |
| January 2022 | +0.75 |

Positive means the tokens closer to their caps tended to perform better in that comparison. Starting in October 2020 or January 2022 supports my intuition; starting in January 2021 gives me the opposite sign.

With three tokens, Bitcoin’s performance and AVAX’s entry price can move the result a lot. Going back to January 2020 leaves me with BTC and ADA from this capped group, which is too little to make a correlation useful.

The [annual comparisons](/assets/research/helicon/annual-correlations.csv) have the same problem. Higher starting circulation/max goes with worse returns in the 2021, 2023 and 2024 intervals, and better returns in 2022, 2025 and 2026 through early September. I start with three capped tokens and add SUI once it has a full starting observation. These intervals run between the first January snapshots, with a partial period for 2026.[^4]

<figure class="helicon-chart" id="avax-history">
  <img class="helicon-fallback" src="/assets/research/helicon/avax-monthly.svg" width="820" height="360" alt="AVAX monthly USD price from October 2020 to September 2026, showing a large rally and collapse while reported supply maturity increased." loading="lazy">
  <div class="helicon-interactive" hidden>
    <p class="helicon-chart-title">AVAX price and circulating supply</p>
    <div class="helicon-plot"></div>
    <dl class="helicon-values">
      <div><dt>Snapshot</dt><dd data-value="date"></dd></div>
      <div><dt>Price (USD)</dt><dd data-value="price"></dd></div>
      <div><dt>Circulating AVAX</dt><dd data-value="circulating"></dd></div>
      <div><dt>Share of 720M cap</dt><dd data-value="ratio"></dd></div>
    </dl>
    <label for="avax-month">Explore a monthly snapshot</label>
    <input id="avax-month" type="range" min="0" max="71" step="1" value="71" aria-describedby="avax-chart-help">
    <p class="helicon-chart-help" id="avax-chart-help">Hover or tap the line, or use the slider. Arrow keys move one month at a time.</p>
  </div>
  <script type="application/json" id="avax-history-data">{{ site.data.helicon_avax | jsonify }}</script>
  <figcaption>Source: CoinMarketCap monthly snapshots, 4 October 2020–6 September 2026. Monthly observations do not capture every daily high or low. Circulating supply is provider-reported. The price path alone does not identify the effect of supply. <a href="/assets/research/helicon/monthly-snapshots.csv">Download the data</a>.</figcaption>
</figure>

AVAX went from $3.96 and 24.5M circulating in [October 2020, about 3.4%](https://coinmarketcap.com/historical/20201004/) of the 720M ceiling, to [$113.19 and 33.9% in January 2022](https://coinmarketcap.com/historical/20220102/). In [January 2023, it was $10.87 and 43.3%](https://coinmarketcap.com/historical/20230101/). By [September 2026, it was $7.91 and about 60.0%](https://coinmarketcap.com/historical/20260906/).[^5]

Investors paid more and then much less per AVAX while the circulating share kept increasing. Dilution can still have a cost, but I can’t explain that price history from proximity to max supply.

I also compared the same tokens over time, pairing their starting supply ratios with returns three or twelve monthly snapshots later. I removed each token’s average and each shared starting period’s average to reduce the influence of persistent differences between tokens and common market conditions.

For BTC, AVAX and ADA from October 2020, the [adjusted correlations](/assets/research/helicon/panel-results.csv) were −0.17 for three-month returns and −0.60 for twelve-month returns. I didn’t find the positive relationship I expected.

I wouldn’t turn those negative numbers into a recommendation to issue faster. I still have three assets, overlapping return windows, and no control for changing adoption, liquidity or security. Adding months doesn’t give me more independent tokens.

There’s another limit: AVAX hasn’t reached the part of the supply curve I’m talking about. Neither AVAX, ADA nor SUI reaches 90% of its ceiling in this sample. Bitcoin starts 2020 around 86% issued, so it gives me little evidence about what happens after a young token distributes most of its remaining supply. I can’t observe the AVAX recovery I’m hypothesizing.

The [uncapped comparison](/assets/research/helicon/cohort-returns.csv) didn’t give me a consistent result either. From 2021, I kept BTC, AVAX and ADA as the capped group, and ETH, SOL, ATOM and NEAR as the uncapped group. The uncapped group has the higher average price return in three intervals and the lower return in three. Remove SOL and its advantage disappears in 2021 and 2023. The 2020 comparison has two tokens per group, so I kept it separate.[^4]

I still prefer thinking about uncapped tokens through expected net inflation over my holding period. [ETH combines issuance with fee burns](https://ethereum.org/roadmap/merge/issuance/). SOL has an [issuance schedule with a continuing long-term rate](https://solana.com/staking).[^6] But an uncapped token can still have allocation releases, recipients who sell, or future policy changes. I haven’t built a comparable historical net-inflation series across these tokens, so I can’t say net inflation caused the differences in returns.

A capped token also needs that analysis. Its max supply doesn’t tell me how many tokens could reach the market in the next two years.

For Helicon, I have to include what Avalanche gets in exchange for issuance. [Auto-renewed validator staking](https://academy.avax.network/docs/acps/236-auto-renewed-staking) and a [shorter minimum staking period](https://github.com/avalanche-foundation/ACPs/tree/main/ACPs/273-reduce-minimum-staking-duration) change how validators manage their commitments. ACP-285 adjusts the incentive to choose longer durations alongside those changes.[^7] Spending the reward budget faster would also mean having less of it available to pay for future security.

My argument has a discounting problem too. If I assume the same future cost and a positive discount rate, moving that cost further away reduces its present value. To argue that slower issuance hurts valuation, I need something else, such as uncertainty that deters buyers or a change in demand. A later release date alone isn’t enough.

The cost of accelerating distribution could be large. Moving from 60% to 100% of an unchanged ceiling means about 67% more circulating units. Hold circulating market cap constant and the price per token falls about 40%. That calculation assumes a fixed market cap; it predicts neither investor demand nor whether AVAX reaches 720M circulating after burns.

For faster issuance to help holders, buyers would have to pay enough for the reduced future overhang to compensate for the earlier dilution. They could also price that improvement before distribution finishes. My thesis can’t depend on buyers waiting until the last token enters circulation.

[Keyrock’s study of more than 16,000 unlock events](https://keyrock.com/from-locked-to-liquidity-what-16000-token-unlocks-teach-us/) gives me some evidence of adverse price effects around releases.[^8] I can’t apply a vesting-event result to a change in AVAX’s long staking-reward schedule and claim I’ve proved the same effect.

I still think investors may discount substantial future releases, especially if the timing or recipients make selling pressure hard to estimate. I haven’t found evidence here that issuing AVAX faster would remove enough of that discount to make holders better off.

After Helicon, I’d look at issuance and burns against the projection, and check how validators change their staking durations and participation. For valuation, I’d estimate how much supply could become available over the next 12–36 months, who gets it and how much demand could absorb it. Circulating/max supply was where I started. I’d need those other estimates before using it to argue against reducing AVAX issuance.

[^1]: [Download the monthly observations](/assets/research/helicon/monthly-snapshots.csv) or the [reproduction bundle](/assets/research/helicon/reproduction.zip), including the input data and calculation script. [Data notes](/assets/research/helicon/README.txt). Original calculations from 81 CoinMarketCap first-Sunday monthly snapshots, 5 January 2020–6 September 2026, with supplemental early SOL listings. The companion dataset retains every source URL, first observation, missing value and calculation. [First historical snapshot](https://coinmarketcap.com/historical/20200105/). This is a selected ten-token sample, not the full historical investment universe; it excludes staking income and does not correct for survivorship bias.

[^2]: Original calculations using the [7 May 2023](https://coinmarketcap.com/historical/20230507/) and [6 September 2026](https://coinmarketcap.com/historical/20260906/) snapshots. Circulation is provider-reported. ADA’s 81.6% here uses CoinMarketCap; the earlier CoinGecko-based study reported 83.4% on a different date. Those observations are not spliced together. Snapshot dates do not establish identical intra-day price-fixing times.

[^3]: Aptos Foundation, [cap proposal 183](https://governance.aptosfoundation.org/proposal/183?votesPage=0) and its [voting-only source script](https://github.com/aptos-foundation/mainnet-proposals/blob/main/sources/2026-02-25-supply-cap/supply_cap.move); Polkadot Forum, [March 2026 changes](https://forum.polkadot.network/t/changes-on-polkadot-in-march-2026/17101). Sui’s [supply schedule](https://www.sui.io/token-schedule) specifies its 10B ceiling. Policies and implementation qualifications were checked on 9 September 2026.

[^4]: Original interval and panel calculations in the companion research. Annual comparisons begin at the first January Sunday and end at the following first January Sunday; the 2026 interval ends 6 September. Panel outcomes are logarithmic price returns. Coefficients are descriptive, with no naive row-level significance claims. Starting dates were explored during the analysis; this is not a preregistered or out-of-sample trading test.

[^5]: CoinMarketCap snapshots: [4 October 2020](https://coinmarketcap.com/historical/20201004/), [2 January 2022](https://coinmarketcap.com/historical/20220102/), [1 January 2023](https://coinmarketcap.com/historical/20230101/) and [6 September 2026](https://coinmarketcap.com/historical/20260906/). Ratios use the 720M policy ceiling consistently, rather than varying raw provider maximum fields. Reported circulation changes can include allocation releases and classification changes; they are not a measured minting series.

[^6]: Ethereum.org, [issuance and supply](https://ethereum.org/roadmap/merge/issuance/); Solana, [staking and inflation policy](https://solana.com/staking). Neither an old issuance example nor a staking reward rate is used here as a current net-inflation observation.

[^7]: Avalanche Builder Hub, [ACP-285](https://docs.avax.network/docs/acps/285-reduce-minimum-consumption-rate) and the [Helicon announcement](https://academy.avax.network/blog/helicon-upgrade). Projection and announced activation date as checked on 9 September 2026.

[^8]: Keyrock, [From Locked to Liquidity: What 16,000+ Token Unlocks Teach Us](https://keyrock.com/from-locked-to-liquidity-what-16000-token-unlocks-teach-us/), December 2024. Event-study findings do not independently identify the effect of AVAX staking-issuance timing.
