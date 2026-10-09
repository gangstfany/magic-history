# APWH Unit 5 Location Study Design

## Goal

Add a complete AP World History: Modern Unit 5 location-study layer to the existing map. The module must help students connect Atlantic revolutions, nationalism, industrialization, and social responses without turning every Timeline pin into an equally large lesson.

The approved model continues the Unit 4 pattern: **vertical causation plus horizontal comparison**.

- ten core locations each present three study points in causal order;
- causal links connect developments within and across locations;
- related links support comparison without claiming direct causation;
- the remaining nine Unit 5 Timeline locations remain available as evidence but do not receive full three-card study views.

## Approved Decisions

- Use exactly ten core locations and exactly three study points per location, for thirty records.
- Reuse the existing Unit 5 Timeline assignments, map pins, causal chains, shared renderer, and homepage iframe bridge.
- Keep all thirty-one existing Unit 5 Timeline events. No event or secondary location is deleted.
- Keep the Timeline Dock concise: year plus short event name. Full explanations remain in the right-side detail panel.
- Use process-first learner labels so students do not need to recognize a city before understanding its historical role.
- Add one Unit 5 Context Card and one Unit 5 Synthesis Card.
- Do not add a new page mode, new panel, new physical pin, or duplicate Timeline dataset.

## Course Coverage

The thirty records and two unit cards collectively cover College Board Unit 5 Topics 5.1–5.10:

- 5.1 The Enlightenment;
- 5.2 Nationalism and Revolutions in the Period from 1750 to 1900;
- 5.3 Industrial Revolution Begins;
- 5.4 Industrialization Spreads in the Period from 1750 to 1900;
- 5.5 Technology of the Industrial Age;
- 5.6 Industrialization: Government's Role from 1750 to 1900;
- 5.7 Economic Developments and Innovations in the Industrial Age;
- 5.8 Reactions to the Industrial Economy from 1750 to 1900;
- 5.9 Society and the Industrial Age;
- 5.10 Continuity and Change in the Industrial Age.

Unit 5 is treated as two connected transformations, not two unrelated chapters: rights and popular sovereignty redefine political legitimacy, while industrial production changes the material power of states and the social groups able to make new claims.

## Scope

- Add `data/apwh-u5-location-study.js` as the single immutable Unit 5 study-data module.
- Add thirty complete English learner records.
- Add validated reciprocal causal and related connections.
- Add `docs/data-sources/apwh-u5-location-study-source-ledger.md` with one row per stable ID.
- Register Unit 5 in the existing per-Unit module registries in `world-map.html` and `index.html`.
- Reuse `connectionTimelineMode: 'main-event'` and the tested filter, Timeline, Back, focus, and homepage synchronization behavior.
- Add focused Node validation and standalone/homepage browser contracts.

## Non-goals

- Do not rewrite the existing Unit 5 causal chains or reorder their stops.
- Do not change Unit 5 Timeline membership or event copy.
- Do not make all nineteen Timeline locations full study views.
- Do not add cross-module study links to Units 1–4 or Unit 6.
- Do not imply that a representative city is the only location where a regional process occurred.
- Do not duplicate long explanations inside Timeline cards.

## Canonical Location Manifest

| Pin | Learner label | Main-event binding | Learning role |
| --- | --- | --- | --- |
| `23` | `Enlightenment Foundations · London` | `world-event-23-2` | Natural law, social contract, and portable rights claims |
| `51` | `American Revolution · Philadelphia` | `world-event-51-0` | Colonial self-government, independence, and republican limits |
| `24` | `French Revolution · Paris` | `world-event-24-1` | Old Regime crisis, popular sovereignty, radicalization, and Napoleonic diffusion |
| `66` | `Haitian Revolution · Saint-Domingue / Port-au-Prince` | `world-event-66-1` | Plantation slavery, enslaved revolt, emancipation, and independence |
| `52` | `Latin American Independence · Caracas` | `world-event-52-0` | Creole grievances, Bolívar, fragmented independence, and caudillo politics |
| `36` | `Industrial Revolution · Manchester` | `world-event-36-0` | British preconditions, steam-powered factories, and class transformation |
| `29` | `Nationalism and Industrial Power · Berlin` | `world-event-29-0` | German nationalism, state unification, and second-wave industrial power |
| `14` | `Meiji State-Led Industrialization · Edo / Tokyo` | `world-event-14-1` | Political restructuring, state investment, and industrial-military power |
| `84` | `Muhammad Ali's Egypt · Cairo` | `world-event-84-2` | Cotton, conscription, factories, and the limits of state-led reform |
| `105` | `Women's Rights · Seneca Falls` | `world-event-105-0` | Revolutionary language, continued exclusion, and organized rights claims |

Main-event bindings are stable entry points. A study point may cover a longer process than its bound Timeline event, but all claims must remain within Unit 5 and clearly identify representative geography.

## Canonical Study-Point Manifest

| Location | Stable ID | Study point | Date | Primary topics | Lens |
| --- | --- | --- | --- | --- | --- |
| London | `apwh-u5-london-natural-law-empiricism` | `Natural Law and Empirical Reasoning` | `1600s–1700s` | 5.1 | condition |
| London | `apwh-u5-london-social-contract-natural-rights` | `Social Contract and Natural Rights` | `1651–1762` | 5.1 | mechanism |
| London | `apwh-u5-london-rights-language-atlantic` | `Rights Language Becomes Portable` | `1700s` | 5.1, 5.2 | consequence |
| Philadelphia | `apwh-u5-philadelphia-colonial-self-government` | `Colonial Self-Government and Imperial Conflict` | `1600s–1775` | 5.2 | condition |
| Philadelphia | `apwh-u5-philadelphia-declaration-independence` | `Declaration, War, and Independence` | `1776–1783` | 5.2 | mechanism |
| Philadelphia | `apwh-u5-philadelphia-republican-rights-limits` | `Republican Rights and Their Limits` | `1776–1800` | 5.2 | consequence |
| Paris | `apwh-u5-paris-old-regime-fiscal-crisis` | `Old Regime Privilege and Fiscal Crisis` | `1780s–1789` | 5.2 | condition |
| Paris | `apwh-u5-paris-popular-sovereignty-rights` | `Popular Sovereignty and the Rights of Man` | `1789–1792` | 5.1, 5.2 | mechanism |
| Paris | `apwh-u5-paris-radicalization-napoleonic-diffusion` | `Radicalization and Napoleonic Diffusion` | `1792–1815` | 5.2 | consequence |
| Port-au-Prince | `apwh-u5-haiti-plantation-slavery` | `Plantation Wealth and Racial Slavery` | `1700s–1791` | 5.2 | condition |
| Port-au-Prince | `apwh-u5-haiti-enslaved-revolt-toussaint` | `Enslaved Revolt and Toussaint L'Ouverture` | `1791–1802` | 5.2 | mechanism |
| Port-au-Prince | `apwh-u5-haiti-emancipation-independence` | `Emancipation and Haitian Independence` | `1793–1804` | 5.2 | consequence |
| Caracas | `apwh-u5-caracas-creole-grievances-imperial-crisis` | `Creole Grievances and Imperial Crisis` | `1750–1810` | 5.2 | condition |
| Caracas | `apwh-u5-caracas-bolivar-independence-wars` | `Bolívar and the Wars of Independence` | `1810–1825` | 5.2 | mechanism |
| Caracas | `apwh-u5-caracas-fragmentation-caudillo-limits` | `Fragmentation, Caudillos, and Limited Social Change` | `1820s–1870s` | 5.2 | consequence |
| Manchester | `apwh-u5-manchester-coal-capital-agriculture` | `Coal, Capital, and Agricultural Change` | `1700s` | 5.3 | condition |
| Manchester | `apwh-u5-manchester-steam-factory-system` | `Steam Power and the Factory System` | `1769–1830s` | 5.3, 5.5, 5.7 | mechanism |
| Manchester | `apwh-u5-manchester-urban-class-labor-response` | `Urban Classes and Labor Responses` | `1800s–1900s` | 5.8, 5.9, 5.10 | consequence |
| Berlin | `apwh-u5-berlin-napoleonic-occupation-nationalism` | `Napoleonic Occupation and German Nationalism` | `1800s–1848` | 5.2 | condition |
| Berlin | `apwh-u5-berlin-bismarck-wars-unification` | `Bismarck, War, and German Unification` | `1862–1871` | 5.2 | mechanism |
| Berlin | `apwh-u5-berlin-second-industrial-revolution-power` | `Second Industrial Revolution and National Power` | `1870s–1900` | 5.4, 5.5, 5.7 | consequence |
| Tokyo | `apwh-u5-tokyo-tokugawa-order-foreign-pressure` | `Tokugawa Order and Foreign Pressure` | `1603–1868` | 5.4, 5.6 | condition |
| Tokyo | `apwh-u5-tokyo-meiji-political-fiscal-reform` | `Meiji Political and Fiscal Reform` | `1868–1880s` | 5.6 | mechanism |
| Tokyo | `apwh-u5-tokyo-state-industry-military-power` | `State Industry and Military Power` | `1870s–1900` | 5.4, 5.5, 5.6 | consequence |
| Cairo | `apwh-u5-cairo-military-pressure-reform` | `Military Pressure and the Demand for Reform` | `1798–1805` | 5.4, 5.6 | condition |
| Cairo | `apwh-u5-cairo-cotton-conscription-factories` | `Cotton, Conscription, and State Factories` | `1805–1848` | 5.4, 5.6 | mechanism |
| Cairo | `apwh-u5-cairo-debt-intervention-limits` | `Debt, Foreign Intervention, and the Limits of Reform` | `1840s–1882` | 5.4, 5.6, 5.10 | consequence |
| Seneca Falls | `apwh-u5-seneca-rights-language-exclusion` | `Revolutionary Rights and Women's Exclusion` | `1776–1848` | 5.1, 5.8, 5.9 | condition |
| Seneca Falls | `apwh-u5-seneca-declaration-sentiments` | `The Declaration of Sentiments` | `1848` | 5.8, 5.9 | mechanism |
| Seneca Falls | `apwh-u5-seneca-organized-feminism-limits` | `Organized Feminism and Limited Immediate Change` | `1848–1900` | 5.8, 5.9, 5.10 | consequence |

Every record must provide one or two approved Exam Skills, valid AP themes, a concise summary, significance, actors, explained terms, at least two evidence statements, an actionable Exam Connection, and a reproducible source locator.

## Secondary Timeline Locations

Nine locations remain visible in the Unit 5 Timeline and may be cited inside evidence or comparison notes, but they do not publish three-card study views:

- Glasgow supplies Adam Smith and laissez-faire evidence for London and Manchester.
- Rome supplies a comparison with German national unification.
- Beijing and Istanbul supply comparisons with Egyptian and Japanese reform.
- Hangzhou supplies Great Divergence evidence for Manchester.
- Moscow supplies serf-emancipation and modernization comparison evidence.
- Cusco and Buenos Aires deepen the limits of Latin American revolutionary change.
- Washington D.C. supplies abolition evidence and a comparison with the exclusions of earlier Atlantic revolutions.

## Causal and Comparison Architecture

### Vertical causal paths

Each location's three records form an ordered causal path. Required cross-location causal connections are:

- London's portable rights language informs the independence claim made in Philadelphia.
- the American precedent in Philadelphia helps make revolutionary change thinkable in Paris.
- French revolutionary claims create an opening that enslaved people in Saint-Domingue apply more radically.
- Atlantic revolutionary examples and Spain's imperial crisis shape the independence movement represented at Caracas.
- French occupation strengthens the nationalism later used to unify Germany.
- Manchester's industrial system demonstrates the productive and military gap that reformers in Egypt and Japan try to close.
- the gap between American rights claims and continued exclusion supplies the language challenged at Seneca Falls.

Every causal note must state a mechanism, not mere chronological succession.

### Horizontal comparisons

Required related comparisons are:

- American political independence versus Haitian emancipation and independence;
- Haitian social revolution versus creole-led Latin American independence;
- French and German nationalism as different paths from revolutionary occupation to nation-state formation;
- Egyptian and Japanese state-led industrialization, including differences in fiscal capacity and foreign constraint;
- labor/class responses in Manchester versus the rights-based social claim represented at Seneca Falls.

Related connections must be reciprocal and share the same comparison note at both endpoints. Manchester's evidence also compares British industrial growth with the Asian manufacturing displacement represented by Hangzhou, but Hangzhou remains cited evidence rather than an unresolved graph endpoint.

## Context and Synthesis Cards

The Context Card bridges Unit 4 to Unit 5: maritime empires generated wealth while codifying coerced labor, legal status, and ancestry-based hierarchy. Enlightenment claims about natural rights and consent gave excluded groups a reusable language for challenging who could rule and who possessed rights.

The Synthesis Card bridges Unit 5 to Unit 6: industrial production concentrated capital and labor, increased states' transport and military capacities, and created recurring demand for raw materials and markets. Those capabilities and pressures help explain the imperial expansion and migration patterns studied in Unit 6.

The cards remain map-independent and do not become Timeline events or causal-chain stops.

## Runtime and Interaction Flow

1. Selecting Unit 5 loads its existing Timeline and map anchors.
2. Selecting one of the ten approved pins or its bound Timeline card renders ordinary event detail.
3. The detail panel exposes `View all 3 study points` only for a supported Unit 5 location.
4. Activating the entry opens the process-first study heading and three records.
5. Exactly one record is expanded at a time.
6. Causal or related connections synchronize the study record, map pin, and exact Timeline event through the existing capability-driven navigation.
7. Connection Back and outer Back restore filters, Timeline state, ordinary detail, homepage controls, and focus.
8. Switching Units clears Unit 5 study state.
9. The homepage mirror preserves exact content and behavior parity with the standalone map.

## Validation and Failure Handling

The module follows the Unit 4 immutable API and fails validation for malformed IDs, wrong location or main-event bindings, invalid taxonomy, incomplete English content, invalid dates, malformed graph relationships, missing source metadata, ledger drift, or any location not publishing exactly three records.

Unknown runtime lookups retain the established empty-array or null behavior. Unsupported Unit 5 pins continue to show ordinary event detail without a study entry.

## Accessibility and Responsive Behavior

- All entries, record toggles, connections, Back controls, and return controls remain semantic buttons with keyboard activation and visible focus.
- Long process-first headings may wrap without horizontal page scrolling.
- The shared mobile single-column layout remains unchanged.
- Expanded details preserve `aria-expanded`, current-record semantics, and one-open behavior.
- Timeline cards remain horizontally scrollable and concise.

## Source Ledger

Create `docs/data-sources/apwh-u5-location-study-source-ledger.md` with one exact row for each stable ID. Each row records Topic assignments, main-event binding, an edition-neutral AMSCO Unit 5 topic locator, supported claims, and any geographic caveat. The ledger and module must contain the same thirty IDs; placeholders and whole-book citations are prohibited.

The official framework authority is the College Board AP World History: Modern Course and Exam Description effective Fall 2026. Learner explanations use the project's audited AMSCO Unit 5 material and must not silently copy known textbook errors.

## Testing Strategy

Implementation follows test-driven development.

- Data tests lock the ten-location/thirty-record manifest, full learner content, Topics 5.1–5.10 coverage, stable ordering, immutability, graph integrity, unit cards, and ledger parity.
- Browser tests cover all ten locations in standalone and homepage contexts, exact record order, one-open behavior, inner and outer Back, focus, Unit switching, and representative within-location causal, cross-location causal, and related jumps.
- Filter-sensitive connection tests reuse the Unit 4 contracts for exact Timeline visibility, region/category/query restoration, outer Back, and a two-level connection stack.
- Regression runs include the full Node suite, the complete Playwright verifier, and `git diff --check`.

## Acceptance Criteria

- Unit 5 exposes exactly ten study locations and thirty validated records.
- All Topics 5.1–5.10 have explicit coverage.
- All existing Unit 1–4 study modules, all Unit 5 Timeline events, map pins, causal chains, and cross-Unit seams remain unchanged.
- Standalone and homepage study views have content and interaction parity.
- Cross-location navigation never leaves the Timeline, map, detail panel, filters, host controls, or focus out of sync.
- Unsupported Unit 5 locations remain fully usable as ordinary Timeline/map events.
- Focused tests, full Node tests, browser verification, and diff checks pass.
