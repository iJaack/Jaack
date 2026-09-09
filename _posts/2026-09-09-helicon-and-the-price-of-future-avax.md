---
title: "helicon and the price of future AVAX"
layout: post
date: 2026-09-09 09:00:00 +0200
permalink: /helicon-and-the-price-of-future-avax/
tag:
- research
- avalanche
- tokenomics
category: blog
author: jaack
description: "Ahead of Helicon, I compared ten tokens from 2020 to test whether future supply deserves a valuation discount—and what the evidence can say about slower AVAX issuance."
published: true
lang: en
custom_stylesheets:
- /assets/research/helicon/article.css
---

Avalanche’s upcoming Helicon upgrade is what made me question whether lower token issuance is always better for valuation.

Mainnet activation is scheduled for 22 September 2026. Helicon includes changes to staking and C-Chain execution, but the part that started this discussion is ACP-285: a change to the staking reward curve intended to reduce AVAX inflation and extend the network’s security budget.[^7]

The mechanism matters. The minimum consumption-rate parameter falls from 10% to 7.5% over 90 days, while the maximum stays unchanged. Those percentages are inputs to the reward formula, not AVAX inflation rates or the yield every staker receives. The proposal projects a reduction of 0.5–1 percentage point in annual inflation under its modelling assumptions.[^7]

My first reaction was: lower dilution today sounds good, but AVAX still has a 720M ceiling. Slowing issuance leaves more of the reward budget for later. Could investors discount AVAX for longer because that future supply is still there?

That is the question behind this research.

My intuition had two stages. Issuing the remaining tokens faster could make the price much worse during distribution. Once circulating supply approached the ceiling, a smaller future supply overhang could make the token more attractive. Investors might prefer an asset whose substantial releases are already behind it, even if getting there was painful.

I was not assuming those stages would cancel each other out. The possible benefit comes later; the additional dilution arrives first. To argue that slower issuance is a problem, I need evidence that the later improvement is real and worth that earlier cost.

I also thought uncapped tokens might have an advantage here. With ETH, there is no final token to wait for. Expectations can focus on issuance, burns and net inflation over the holding period. That seemed easier to reason about than the distant end of a capped token’s distribution.

So I compared AVAX with BTC, ETH, SOL, APT, SUI, ADA, DOT, ATOM and NEAR, extending the history back to 2020. I wanted to know whether tokens closer to their supply ceilings subsequently performed better, and whether uncapped tokens behaved differently.

Some windows supported my intuition. Changing the starting date was enough to reverse the result. That weakens the case for treating Helicon’s longer issuance runway as a valuation problem by itself.

This is research ahead of the upgrade. As of 9 September 2026, Helicon has not activated on mainnet, and the historical dataset ends on 6 September. None of the returns below measures its realized effect.

The full dataset contains 81 monthly snapshot dates, from 5 January 2020 to 6 September 2026. There are 705 price observations and 704 reported circulating-supply observations. Tokens enter when observations become available. AVAX starts in October 2020, APT in November 2022 and SUI in May 2023 on this monthly grid. These are observation dates, not exact launch dates.[^1]

For the historical comparison, I used CoinMarketCap throughout. Mixing supply definitions across providers would introduce another variable into an already small sample. Even with one provider, circulating supply is a reported classification. It can change because tokens are minted, existing allocations become available, or the provider changes how it counts them.

One early SOL observation has a price but no reported circulation. I left the supply blank. A missing number cannot become evidence just because the table looks better when every cell is filled.

To connect this comparison to Helicon, I had to separate a few things that get compressed into the word “emissions.”

Minting creates tokens. Vesting makes existing allocations available. Staking rewards can come from issuance or existing revenue, depending on the protocol. Burns destroy tokens. Unstaking changes liquidity without necessarily changing total supply. A staking APR measures rewards against staked capital; it is not automatically the inflation rate of the whole token supply.

This matters for “99% unlocked.” That could describe investor vesting, the share of existing tokens considered circulating, or the share of an eventual ceiling already in circulation. Each tells you something different about future supply pressure.

For AVAX, the gap between reported circulation and 720M also cannot be treated as one future unlock: it includes distinctions between existing allocations and tokens yet to be minted. Helicon changes the staking-reward mechanism. It does not accelerate or postpone every allocation release.

I used circulating supply divided by the policy ceiling as the first measure of supply maturity. It is easy to understand, but it says very little about timing or recipients. The same remaining quantity can arrive next month, over several years, or through a long reward schedule.

Here is the ten-token comparison on a common price window. Supply shares use the 6 September 2026 snapshot. Returns run from 7 May 2023 to 6 September 2026, so APT and SUI are not being compared against years when they did not exist. These are USD price returns, excluding staking rewards.[^2]

| Token | Supply ceiling | Circulating / ceiling | Price return, common period |
|---|---:|---:|---:|
| BTC | 21M | 95.6% | +182.4% |
| ETH | No fixed cap | N/A | +34.2% |
| AVAX | 720M | 60.0% | −51.9% |
| SOL | No fixed cap | N/A | +387.3% |
| APT | 2.1B approved* | 40.9%* | −93.2% |
| SUI | 10B | 41.0% | −34.8% |
| ADA | 45B | 81.6% | −40.8% |
| DOT | 2.1B† | 81.0% | −82.7% |
| ATOM | No fixed cap | N/A | −85.5% |
| NEAR | No fixed cap | N/A | +39.9% |

*APT’s cap was approved, but subsequent protocol enforcement was not verified in this research. The ratio is conditional on that approved ceiling. †DOT introduced its cap during 2026. Both stay in the comparison table, but neither enters the historical correlations that require a consistent cap policy. An uncapped ratio is undefined; assigning it 100% would manufacture a comparison.[^3]

There is another trap here. If market cap is price multiplied by circulating supply, and cap-based FDV is price multiplied by maximum supply, then market cap divided by FDV is already circulating supply divided by maximum supply. Finding a relationship between those ratios would prove an accounting identity.

I compared supply maturity with subsequent price performance instead. That still does not directly measure a valuation discount. Price is the outcome available in this study; a discount is an explanation that needs more evidence.

The starting-date test made that clear.

For BTC, AVAX and ADA, I kept the tokens and September 2026 endpoint fixed. I then compared the supply ratio at the start with the cumulative price return afterward.

| Starting snapshot | Correlation with subsequent price return |
|---|---:|
| October 2020 | +0.71 |
| January 2021 | −0.16 |
| January 2022 | +0.75 |

A positive value means the tokens closer to their caps generally did better in that comparison. Moving the start from October 2020 to January 2021 changed the sign. Moving it to January 2022 made it positive again.

There are only three tokens in that test. Bitcoin’s performance, AVAX’s entry price and Cardano’s cycle can each move the result substantially. January 2020 is even thinner: only BTC and ADA qualify from the selected capped tokens. I did not turn a two-point correlation into a research finding.

The annual comparisons also alternate. Higher starting supply maturity accompanies worse returns in the 2021, 2023 and 2024 intervals, and better returns in 2022, 2025 and 2026 through early September. Those comparisons contain three capped tokens initially and four once SUI has a full starting observation. They are January-to-January snapshot intervals, with a partial 2026 period, rather than exact calendar-year returns.[^4]

I can find a window that agrees with my intuition. I can also find one that disagrees. I cannot treat either as a stable rule.

<figure class="helicon-chart">
  <img src="/assets/research/helicon/avax-monthly.svg" width="820" height="360" alt="AVAX monthly USD price from October 2020 to September 2026, showing a large rally and collapse while reported supply maturity increased." loading="lazy">
  <figcaption>Monthly observations do not capture every daily high or low. The price path alone does not identify the effect of supply.</figcaption>
</figure>

AVAX makes the problem concrete. In October 2020, its reported circulating supply was 24.5M, about 3.4% of the 720M ceiling, and its price was $3.96. By January 2022, the ratio was 33.9% and the price was $113.19. In January 2023, the ratio was 43.3% and the price was $10.87. By September 2026, it was about 60.0% and $7.91.[^5]

Supply maturity increased through a large rally, a collapse and subsequent recoveries and declines. That does not show that dilution had no cost. It shows that other changes in demand and valuation were large enough that the supply ratio could not explain the price path by itself.

I then looked at the same tokens through time. Starting supply ratios were paired with returns three or twelve monthly snapshots later. Removing each token’s average and each shared starting period’s average helps separate the result from stable differences between tokens and common market conditions.

For BTC, AVAX and ADA from October 2020, those adjusted correlations were −0.17 for three-month forward returns and −0.60 for twelve-month forward returns. The longer history did not reveal the positive maturity effect I was looking for.

I would not use the negative coefficients to argue for faster issuance either. The windows overlap, there are only three assets, and the adjustment does not control changing adoption, liquidity, security or each token’s exposure to the market. More rows do not fix a small number of independent assets.

There is also a more basic limit: AVAX has not reached the stage my thesis is about. Neither AVAX, ADA nor SUI reaches 90% circulation against its ceiling in this sample. Bitcoin crosses high supply-maturity thresholds, but it starts 2020 already around 86% issued. That is a different experience from distributing most of a young token’s remaining supply.

The proposed AVAX recovery after near-completion is still unobserved. The data puts limits on the argument without resolving that counterfactual.

The uncapped-token comparison needed a similar correction.

From 2021, I kept a fixed capped group of BTC, AVAX and ADA, and a fixed uncapped group of ETH, SOL, ATOM and NEAR. On average price return, the uncapped group wins in three measured intervals and loses in three. Removing SOL reverses its advantage in 2021 and 2023. The separate 2020 comparison has only two tokens per group, so it cannot be silently added to the same series.[^4]

I still think the flow-based framing is useful. An uncapped token has no meaningful percentage of ultimate supply already issued. Expected net issuance over the holding period is a better starting point.

But an uncapped design does not remove allocation releases, recipient selling or uncertainty about future policy. ETH’s issuance and fee burns need to be considered together. SOL’s issuance schedule has a continuing long-term rate. The economics depend on the rules and demand behind those flows.[^6]

The same applies to capped tokens. A hard cap does not tell me whether the next two years contain heavy releases, or whether the remaining reward budget will be distributed slowly. I cannot rank those risks from the ceiling alone. This study also does not contain a harmonized historical net-inflation series, so it cannot attribute the uncapped group’s performance to net inflation.

That brings me back to the decision Helicon puts in front of AVAX holders.

The projected inflation saving is only one part of the design. Auto-renewed validator staking and a shorter minimum staking period change how validators can manage their commitments. ACP-285 adjusts the reward incentive for choosing longer durations alongside those changes.[^7] I would evaluate issuance together with the security and participation it pays for.

Lower issuance today can reduce near-term dilution while leaving more of the reward budget available for later. The unresolved question is how investors value that trade-off. Simply pushing the same quantity further into the future does not prove that its present burden rises; under a positive discount rate, deferring an otherwise identical future cost reduces its present value. An argument against slower issuance needs an additional mechanism, such as uncertainty about future releases or a change in demand.

There is also a simple scale check. Moving from 60% to 100% of an unchanged ceiling would increase circulating units by roughly 67%. If circulating market capitalization stayed constant, price per token would fall roughly 40%. That is conditional arithmetic, not a forecast or a claim that AVAX will literally reach 720M circulating after accounting for burns.

For accelerating issuance to make sense on valuation grounds, removing the future overhang would have to produce a benefit worth that earlier cost and the consequences for the network’s security budget. The eventual improvement could also be anticipated before distribution finishes. There is no reason to assume that the market waits for the last release before changing its expectations.

Existing research on token unlocks gives a reason to take supply pressure seriously. Keyrock’s study of more than 16,000 unlock events reports adverse effects around many releases. But vesting events and a change to a long staking-reward schedule are different mechanisms; that evidence cannot establish the AVAX counterfactual on its own.[^8]

The version of my thesis I can defend is narrower: a large, uncertain or concentrated future release schedule can deserve a valuation discount. Getting rid of that uncertainty could have value. The circulating/max ratio is too crude to tell me how much, when it would appear, or whether accelerating issuance would be worth it.

For Helicon, I would now focus on expected supply becoming available over the next 12–36 months, who receives it, how much may reach the market, and what demand could absorb it. After activation, I would compare actual issuance and burns with the assumptions behind the projection, alongside staking durations and validator participation. A price move on its own would not isolate the upgrade’s effect.

I still think investors can discount substantial future releases. What I cannot support from this research is the next step: that making AVAX reach its ceiling sooner would improve valuation enough to justify the extra dilution. Helicon leaves that question open. A longer reward runway, by itself, is not evidence that holders are worse off.

[^1]: [Download the monthly observations](/assets/research/helicon/monthly-snapshots.csv) or the [reproduction bundle](/assets/research/helicon/reproduction.zip), including the input data and calculation script. [Data notes](/assets/research/helicon/README.txt). Original calculations from 81 CoinMarketCap first-Sunday monthly snapshots, 5 January 2020–6 September 2026, with supplemental early SOL listings. The companion dataset retains every source URL, first observation, missing value and calculation. [First historical snapshot](https://coinmarketcap.com/historical/20200105/). This is a selected ten-token sample, not the full historical investment universe; it excludes staking income and does not correct for survivorship bias.

[^2]: Original calculations using the [7 May 2023](https://coinmarketcap.com/historical/20230507/) and [6 September 2026](https://coinmarketcap.com/historical/20260906/) snapshots. Circulation is provider-reported. ADA’s 81.6% here uses CoinMarketCap; the earlier CoinGecko-based study reported 83.4% on a different date. Those observations are not spliced together. Snapshot dates do not establish identical intra-day price-fixing times.

[^3]: Aptos Foundation, [cap proposal 183](https://governance.aptosfoundation.org/proposal/183?votesPage=0) and its [voting-only source script](https://github.com/aptos-foundation/mainnet-proposals/blob/main/sources/2026-02-25-supply-cap/supply_cap.move); Polkadot Forum, [March 2026 changes](https://forum.polkadot.network/t/changes-on-polkadot-in-march-2026/17101). Sui’s [supply schedule](https://www.sui.io/token-schedule) specifies its 10B ceiling. Policies and implementation qualifications were checked on 9 September 2026.

[^4]: Original interval and panel calculations in the companion research. Annual comparisons begin at the first January Sunday and end at the following first January Sunday; the 2026 interval ends 6 September. Panel outcomes are logarithmic price returns. Coefficients are descriptive, with no naive row-level significance claims. Starting dates were explored during the analysis; this is not a preregistered or out-of-sample trading test.

[^5]: CoinMarketCap snapshots: [4 October 2020](https://coinmarketcap.com/historical/20201004/), [2 January 2022](https://coinmarketcap.com/historical/20220102/), [1 January 2023](https://coinmarketcap.com/historical/20230101/) and [6 September 2026](https://coinmarketcap.com/historical/20260906/). Ratios use the 720M policy ceiling consistently, rather than varying raw provider maximum fields. Reported circulation changes can include allocation releases and classification changes; they are not a measured minting series.

[^6]: Ethereum.org, [issuance and supply](https://ethereum.org/roadmap/merge/issuance/); Solana, [staking and inflation policy](https://solana.com/staking). Neither an old issuance example nor a staking reward rate is used here as a current net-inflation observation.

[^7]: Avalanche Builder Hub, [ACP-285](https://docs.avax.network/docs/acps/285-reduce-minimum-consumption-rate) and the [Helicon announcement](https://academy.avax.network/blog/helicon-upgrade). Projection and announced activation date as checked on 9 September 2026.

[^8]: Keyrock, [From Locked to Liquidity: What 16,000+ Token Unlocks Teach Us](https://keyrock.com/from-locked-to-liquidity-what-16000-token-unlocks-teach-us/), December 2024. Event-study findings do not independently identify the effect of AVAX staking-issuance timing.
