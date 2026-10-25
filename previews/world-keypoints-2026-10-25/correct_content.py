"""Apply the approved audit to the isolated preview; original exports remain read-only."""
import copy, json
from pathlib import Path

HERE=Path(__file__).resolve().parent
units=json.loads((HERE/'content-audit-data.json').read_text())
original=copy.deepcopy(units)
by_id={r['id']:r for u in units for r in u['records']}
CED='https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description-effective-fall-2026.pdf'
SOURCES={
 'dejima':'https://nagasakidejima.jp/english/history/',
 'manila':'https://blogs.loc.gov/international-collections/2021/10/negotiating-empire-part-i-from-magellan-to-the-founding-of-manila-16th-18th-centuries/',
 'fao':'https://www.fao.org/4/Y1743E/Y1743E03.htm',
 'climate':'https://unfccc.int/process/the-convention/history-of-the-convention',
 'paris':'https://unfccc.int/process-and-meetings/the-paris-agreement',
 'who':'https://www.who.int/news-room/spotlight/history-of-vaccination/a-brief-history-of-vaccination',
 'polio':'https://polioeradication.org/about-polio/history-of-polio/',
 'migration':'https://www.loc.gov/classroom-materials/immigration/chinese/struggling-for-work/',
 'india':'https://www.mea.gov.in/indian-foreign-policy.htm',
 'baghdad':'https://www.metmuseum.org/ja/essays/the-art-of-the-abbasid-period-750-1258',
 'qing':'https://www.harvard-yenching.org/sites/default/files/featurefiles/Jia%20Jianfei_Whose%20Xinjiang.pdf',
 'lagos':'https://nigeriaembassy.org.vn/history-of-nigeria/',
 'alamein':'https://www.nam.ac.uk/explore/battle-alamein',
 'reformation':'https://mediengeschichte.dnb.de/DBSMZBN/Content/DE/Buchdruck/04-buchdruck-und-reformation.html',
 'trent':'https://www.cabinet.ox.ac.uk/catholic-reform',
 'sikh':'https://smarthistory.org/origins-and-development-of-sikh-faith-the-gurus/',
 'smith':'https://www.gla.ac.uk/explore/adamsmith300/lifeworkandlegacy/keyworks/wealthofnations/',
 'marx':'https://www.loc.gov/item/12010343/',
 'darwin':'https://americanhistory.si.edu/explore/exhibitions/everybody/citizens/eugenics',
}
changes=[]
def row(id):return by_id[id]
def update(id, issue, urls=(), **fields):
    r=row(id);r.update(fields)
    r.setdefault('revisionSources',[])
    r['revisionSources']=list(dict.fromkeys(r['revisionSources']+list(urls)))
    changes.append({'issue':issue,'id':id,'fields':list(fields)})
def relink(a,b,note,kind='related'):
    left,right=row(a),row(b)
    for r,target in [(left,b),(right,a)]:
        for field in ['causeStudyPointIds','effectStudyPointIds','relatedStudyPointIds']:
            r[field]=[v for v in r[field] if v!=target]
        r['connectionNotes'][target]=note
    if kind=='cause':left['effectStudyPointIds'].append(b);right['causeStudyPointIds'].append(a)
    else:left['relatedStudyPointIds'].append(b);right['relatedStudyPointIds'].append(a)
def dates(id,label,start,end,issue,url):update(id,issue,[url],dateLabel=label,startYear=start,endYear=end)

# Report 4–6: concrete chronological and necessary-condition errors.
id='apwh-u3-tokugawa-confucian-sakoku-hierarchy'
evidence=list(row(id)['evidence'])
evidence=[('During the 1630s the shogunate tightened maritime restrictions and expelled the Portuguese in 1639; in 1641 it moved the Dutch trading post from Hirado to Dejima in Nagasaki.' if '1630' in e and ('Dutch' in e or 'Nagasaki' in e) else e) for e in evidence]
update(id,4,[SOURCES['dejima']],evidence=evidence)
id='apwh-u4-manila-galleon-route'
update(id,5,[SOURCES['manila']],summary='The transpacific connection began with the 1565 return voyage from Cebu to Acapulco; after Spain established Manila in 1571, Manila became the principal Asian hub of the galleon trade.',evidence=["Urdaneta's 1565 voyage established a practical eastward return route from the Philippines to New Spain.",'Spanish Manila, founded in 1571, linked Asian merchandise to American silver through the later Manila–Acapulco trade.'])
id='apwh-u9-amritsar-high-yield-seeds-input-package'
update(id,6,[SOURCES['fao']],summary='High-yield wheat and rice varieties raised yields when supported by suitable water, nutrients, and crop management; access to credit, land, and machinery shaped adoption, costs, and who benefited.')
relink(id,'apwh-u9-amritsar-unequal-access-land-consolidation','High-yield varieties depended on suitable agronomic conditions. Unequal access to land, water, fertilizer, credit, and machinery shaped adoption and benefits; motorized machinery was not a universal prerequisite for adoption.','cause')

# Report 7–10: distinguish thematic comparison from demonstrated mechanisms.
relink('apwh-u9-paris-universal-rights-global-norm','apwh-u9-paris-kyoto-burden-sharing-debate','Compare human-rights and climate institutions as different responses to transnational problems, balancing international norms, national sovereignty, participation, and enforcement. This is a thematic comparison, not a direct causal claim.')
for a,b in [('apwh-u9-geneva-vaccination-smallpox-eradication','apwh-u9-geneva-hiv-treatment-unequal-access'),('apwh-u9-geneva-hiv-treatment-unequal-access','apwh-u9-geneva-polio-ebola-coordination-limits')]:
    relink(a,b,'Compare global-health programs by distinguishing scientific tools, affordable access, finance, surveillance, local trust, and implementation capacity; their shared challenges do not establish a simple chronological cause-and-effect chain.')
relink('apwh-u9-geneva-vaccination-smallpox-eradication','apwh-u9-geneva-polio-ebola-coordination-limits','Smallpox eradication provided experience in international coordination, surveillance, and targeted vaccination that informed later eradication efforts such as polio. This mechanism concerns polio program design, not the origin of every Ebola response.','cause')
id='apwh-u6-san-francisco-chinese-migration-community'
update(id,9,[SOURCES['migration']],summary='Chinese migration during the Gold Rush and other western employment in the 1850s preceded the major railroad recruitment of the 1860s; migrants built commercial, family, and mutual-aid networks.',evidence=['Gold Rush migrants and other workers were establishing Chinese communities in California before the transcontinental railroad construction boom.','Railroad recruitment expanded an existing migration stream, while associations, businesses, and mutual-aid organizations supported community life.'])
relink('apwh-u6-san-francisco-railroad-labor-demand',id,'Railroad recruitment in the 1860s expanded an earlier migration stream rooted in Gold Rush and other employment; compare labor recruitment with the community networks migrants had already begun to build.')
relink('apwh-u8-delhi-nonalignment-foreign-policy-autonomy','apwh-u8-delhi-five-year-plans-mixed-economy','Compare diplomatic and economic autonomy: the pursuit of foreign-policy independence and domestic planning overlapped, but the 1955 Bandung conference and the 1961 NAM did not initiate India\'s First Five-Year Plan in 1951.')

# Report 11–15: repair labels and unit framing; substantive additions follow.
for id in ['apwh-u3-russia-orthodox-tsardom-boyars-new-capital','apwh-u3-ming-qing-manchu-confucian-ethnic-hierarchy','apwh-u3-tokugawa-confucian-sakoku-hierarchy']:
    update(id,11,[CED],topicCodes=['3.2','3.4'])
for id in ['apwh-u3-ottoman-sunni-millet-imperial-architecture','apwh-u3-safavid-twelver-shiism-ottoman-rivalry','apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy']:
    update(id,11,[CED],topicCodes=['3.2','3.3','3.4'])
for id in ['apwh-u5-seneca-declaration-sentiments','apwh-u5-seneca-organized-feminism-limits']:
    update(id,12,[CED],topicCodes=['5.1']+row(id)['topicCodes'])
update('apwh-u5-manchester-steam-factory-system',2,[CED],topicCodes=['5.3','5.5'])
update('apwh-u5-berlin-second-industrial-revolution-power',2,[CED],topicCodes=['5.4','5.5','5.7'],evidence=row('apwh-u5-berlin-second-industrial-revolution-power')['evidence']+['Joint-stock companies and banks pooled savings and investment capital, helping finance large-scale industrial enterprises.'])
units[8]['context'].update(title='Globalization Since c. 1900',summary='Across the twentieth century, advances in transport, communication, agriculture, and medicine intensified global connections. Institutions created during and after World War II coordinated finance, rights, and health across borders. The end of the Cold War accelerated some forms of market integration, but globalization had earlier foundations and distributed benefits and risks unevenly.',prompt='How did twentieth-century technology, institutions, political changes, and unequal resources shape the scale and consequences of global interaction?',takeaways=['Transportation, communication, and medical advances connected people across borders before 1991.','Postwar institutions coordinated economic and social issues while reflecting unequal power and limits on enforcement.','The Cold War\'s end accelerated some global connections; it did not mark the beginning of all globalization.'])

# Report 16–20: careful scope and chronology rather than unconditional rewrites.
dates('apwh-u1-baghdad-abbasid-knowledge-hub','762–1258',762,1258,16,SOURCES['baghdad'])
id='apwh-u3-ming-qing-restoration-expansion'
dates(id,'1368–1759',1368,1759,17,SOURCES['qing'])
update(id,17,[SOURCES['qing']],significance=row(id)['significance']+' Qing campaigns in Dzungaria and the Tarim Basin extended into 1759; this concluding example crosses the unit\'s approximate 1750 boundary.')
id='apwh-u6-lagos-treaty-trade-political-control'
dates(id,'1861–1887',1861,1887,18,SOURCES['lagos'])
update(id,18,[SOURCES['lagos']],evidence=['Britain annexed Lagos in 1861; it became an earlier coastal base for further expansion.','At Opobo, Jaja\'s 1873 treaty relations and his removal in 1887 illustrate a distinct sequence of commercial pressure, contested interpretation, and coercion.'])
id='apwh-u7-cairo-el-alamein-global-routes'
dates(id,'July–November 1942',1942,1942,19,SOURCES['alamein'])
update(id,19,[SOURCES['alamein']],summary='At El Alamein, west of Alexandria, the July 1942 battle checked the Axis advance; the Allied offensive in October–November broke Axis defenses and forced retreat.',keyTerms=[{'term':'First and Second Battles of El Alamein','explanation':'The July 1942 battle stopped the Axis advance; the October–November Allied offensive broke the Axis defensive line and forced withdrawal.'}],evidence=['The First Battle in July 1942 checked the Axis advance toward Alexandria and the Suez Canal.','The Second Battle, from 23 October to 4 November 1942, opened an Allied offensive that forced Axis forces to retreat.'])
id='apwh-u9-paris-voluntary-climate-governance-limits'
update(id,20,[SOURCES['paris']],title='Paris Agreement: Binding Procedures and Nationally Determined Targets',summary='The Paris Agreement is a legally binding treaty with obligations to prepare, communicate, and maintain nationally determined contributions, alongside transparency and review procedures; each party determines the ambition of its targets.',significance='Broad participation and binding procedural duties support coordination, but nationally chosen target levels and limited enforcement do not guarantee that emissions outcomes will meet collective goals.',evidence=['The agreement was adopted in Paris in 2015 and entered into force in 2016.','Parties must prepare, communicate, and maintain successive NDCs; the treaty does not impose one uniform emissions target on every country.'],examConnection='Distinguish binding treaty and procedural obligations from nationally determined ambition and the limits of enforcing emissions outcomes.')
relink(id,'apwh-u9-washington-institutional-power-benefits-criticism','Compare enforcement and power: financial institutions use weighted voting and lending conditionality; the Paris Agreement imposes binding NDC and transparency procedures, while target ambition remains nationally determined and enforcement of emissions outcomes is limited.')
for health_id in ['apwh-u9-geneva-vaccination-smallpox-eradication','apwh-u9-geneva-hiv-treatment-unequal-access','apwh-u9-geneva-polio-ebola-coordination-limits']:
    update(health_id,8,[SOURCES['who'],SOURCES['polio']])
for climate_id in ['apwh-u9-paris-universal-rights-global-norm','apwh-u9-paris-kyoto-burden-sharing-debate']:
    update(climate_id,7,[SOURCES['climate']])

def add(unit,id,loc,name,event,title,label,start,end,topics,themes,summary,significance,terms,evidence,exam,people,urls,region=None,empire=None,lens=None):
    u=units[unit-1];loc=str(loc)
    if not any(str(v['number'])==loc for v in u['locations']):u['locations'].append({'number':loc,'name':name})
    r={'id':id,'locationNumber':loc,'mainEventKey':event,'sequence':max([v.get('sequence',0) for v in u['records'] if v['locationNumber']==loc]+[0])+1,'title':title,'dateLabel':label,'startYear':start,'endYear':end,'topicCodes':topics,'themeIds':themes,'examSkills':['Causation','Comparison'],'summary':summary,'significance':significance,'keyTerms':[{'term':k,'explanation':v} for k,v in terms],'evidence':evidence,'examConnection':exam,'keyPeople':[{'name':k,'role':v} for k,v in people],'causeStudyPointIds':[],'effectStudyPointIds':[],'relatedStudyPointIds':[],'connectionNotes':{},'source':{'id':'teacher-created-2026-10-25','locator':'Teacher-authored synthesis; College Board CED and linked sources, not an official College Board item or a quotation from AMSCO.'},'authorship':'teacher-created','sourceUrls':list(dict.fromkeys([CED]+urls))}
    if region:r['regionLabel']=region
    if empire:r['empire']=empire
    if lens:r['lens']=lens
    u['records'].append(r);by_id[id]=r
    return id

# Nine new cards: authored explanations, not invented textbook quotations.
song=add(1,'apwh-u1-hangzhou-confucian-bureaucracy-culture','1','Hangzhou','world-event-1-0','Confucian Government, Civil-Service Exams, and Social Order','960–1279',960,1279,['1.1','1.7'],['GOV','CDI','SIO'],
 'Song rulers relied on an expanding civil-service bureaucracy and Confucian learning to govern, while examination access favored families able to finance education.',
 'Exams linked state service to literary learning without eliminating social inequality; Neo-Confucian ideas also reinforced hierarchical relationships.',
 [('civil-service examinations','Competitive tests of classical learning used to recruit officials, not universal or socially equal access to power.'),('Neo-Confucianism','A renewed Confucian intellectual tradition that incorporated responses to Buddhist and Daoist thought while emphasizing moral order.')],
 ['Song governments expanded the role of scholar-officials recruited through examinations in Confucian texts.','Education costs and family resources shaped access; patriarchal norms continued alongside commercial and urban growth.'],
 'Explain how a state maintained authority through trained officials and shared ideas, then compare formal examination access with actual social advantages.',
 [('Scholar-officials','Administered the state and connected classical learning with government service.')],[],region='Song China · Hangzhou is a representative urban and administrative anchor')
relink(song,'apwh-u1-hangzhou-song-commercial-revolution','Compare the institutions that governed Song society with the expanding markets those institutions taxed and administered; commercial growth did not automatically eliminate Confucian social hierarchy.')
crops=add(2,'apwh-u2-kilwa-crop-diffusion-environments','85','Kilwa','world-event-85-0','Crop Diffusion, Population, and Environmental Change','c. 1200–1450',1200,1450,['2.3','2.6','2.7'],['ENV','ECN'],
 'Exchange networks spread useful crops as well as pathogens; crops already introduced before 1200 continued to reshape population and land use during the course period.',
 'The movement of plants changed food supplies and settlement patterns, but effects depended on local environments and cultivation choices.',
 [('crop diffusion','The movement and local adoption of cultivated plants across regions.'),('Champa rice','Early-ripening rice associated with Champa and adopted in China before 1200, with lasting effects on farming and food supply.')],
 ['Bananas of Southeast Asian origin spread into Africa through networks connected to the Indian Ocean; adoption supported cultivation and settlement in suitable regions.','Champa rice spread from Vietnam to China before 1200; its continuing cultivation supported more intensive production, while new farmland and settlement altered landscapes.'],
 'Trace crop movement, local adaptation, and demographic or environmental consequences; distinguish the earlier introduction of a crop from its effects in 1200–1450.',
 [('Farmers, merchants, and migrants','Carried plants and agricultural knowledge and adapted them to local conditions.')],[],region='Indian Ocean and connected regions · Southeast Asia, East Africa, and China; Kilwa is one network anchor, not the site of every transfer')
relink(crops,'apwh-u2-cairo-black-death-demographic-change','Compare different biological consequences of connected networks: crop adoption could support food production and settlement, while epidemic pathogens caused mortality and disruption.')
reform=add(3,'apwh-u3-wittenberg-protestant-reformation','33','Wittenberg','world-event-33-0','Protestant Reformation and Religious Authority','1517–1648',1517,1648,['3.3','3.4'],['CDI','GOV'],
 'Luther\'s challenge to indulgences and church authority in 1517 helped launch reforms that fractured Western Christianity; print and political patronage spread Protestant movements.',
 'Religious change interacted with rulers\' interests and institutional conflict, rather than producing a single uniform Protestant church.',
 [('Protestant Reformation','A set of movements challenging aspects of Catholic doctrine, practice, and authority in sixteenth-century Europe.'),('indulgences','Remissions of temporal punishment for sin; controversy over their preaching and sale became a focus of Luther\'s challenge.')],
 ['Luther circulated the Ninety-Five Theses in 1517; printers and pamphlets widened debates beyond clerical circles.','Rulers and urban authorities protected or opposed reform for religious and political reasons; distinct Protestant traditions developed.'],
 'Explain how belief, print, and state interests interacted; avoid treating religious conflict as a purely theological or purely political process.',
 [('Martin Luther','Challenged indulgence practices and papal authority, becoming a central figure of the Reformation.')],[SOURCES['reformation']],empire='European states',lens='Belief Systems',region='Wittenberg and wider European reform movements; political and religious outcomes varied across states')
catholic=add(3,'apwh-u3-trent-catholic-reform-trent','35','Trent','world-event-35-0','Catholic Reform, Trent, and Global Missions','1540–1600',1540,1600,['3.3','3.4'],['CDI','GOV'],
 'Catholic reform renewed discipline and religious orders while reaffirming doctrines contested by Protestants; the Council of Trent met from 1545 to 1563.',
 'Catholicism changed institutions and expanded missionary activity while preserving papal and sacramental authority, illustrating continuity alongside reform.',
 [('Council of Trent','A Catholic council held in three phases from 1545 to 1563 that reaffirmed doctrine and legislated institutional reform.'),('Jesuits','A Catholic religious order approved in 1540, active in education, missions, and reform.')],
 ['The Council of Trent clarified Catholic teachings and addressed abuses and clerical discipline.','New and reformed orders, including the Jesuits, expanded education and missions in Europe and overseas.'],
 'Compare Protestant challenges with Catholic institutional reform and doctrinal continuity; connect missions to expanding exchange networks without assuming uniform conversion.',
 [('Ignatius of Loyola','Founded the Society of Jesus, linking spiritual discipline with education and missionary work.')],[SOURCES['trent']],empire='Catholic states',lens='Belief Systems',region='Trent and Catholic Europe · the council met at Trent; Rome was the papal center, and missions extended beyond Europe')
relink(reform,catholic,'Protestant challenges intensified Catholic efforts to define doctrine and reform institutions, but Catholic reform also drew on earlier internal movements.','cause')
sikh=add(3,'apwh-u3-punjab-nanak-sikh-community','11','Punjab · Sikh Traditions','world-event-11-2','Guru Nanak and the Formation of Sikh Traditions','c. 1500–1708',1500,1708,['3.3','3.4'],['CDI','SIO'],
 'Guru Nanak taught devotion to one God, ethical conduct, and equality in a Punjabi setting of Hindu and Muslim interaction; Sikh traditions developed distinctive institutions and identity under successive Gurus.',
 'A setting of religious interaction helps explain emergence without reducing Sikhism to a simple mixture of Hinduism and Islam.',
 [('Guru Nanak','The first Sikh Guru, whose teachings founded a distinctive religious community.'),('langar','A communal meal institution emphasizing service and equality.'),('Khalsa','A disciplined Sikh community established by Guru Gobind Singh in 1699.')],
 ['Nanak\'s teaching emphasized devotion, ethical life, and community rather than status based on birth or outward ritual.','Successive Gurus developed community institutions; the Adi Granth was compiled in 1604 and the Khalsa established in 1699.'],
 'Explain the relationship between a context of interaction and a distinct religious development; compare Sikh community formation with Mughal religious policies.',
 [('Guru Nanak','Founded the Sikh community.'),('Guru Gobind Singh','Established the Khalsa in 1699.')],[SOURCES['sikh']],empire='South Asia',lens='Belief Systems',region='Punjab · Nanak\'s early community was centered at Kartarpur; the map\'s Amritsar/Punjab pin represents the wider region')
relink(sikh,'apwh-u3-mughal-akbar-tolerance-aurangzeb-orthodoxy','Compare Sikh community formation and Mughal religious policies while distinguishing the Gurus\' teachings from the changing conditions of imperial patronage and conflict.')
smith=add(5,'apwh-u5-glasgow-smith-market-capitalism','37','Glasgow · Political Economy','world-event-37-0','Adam Smith, Markets, and Free-Trade Arguments','1776–1900',1776,1900,['5.1','5.7'],['ECN','CDI'],
 'Adam Smith criticized mercantilist restrictions and monopolies and explained how specialization and exchange could expand production; nineteenth-century advocates used market and free-trade arguments in economic debate.',
 'Economic liberalism offered a rationale for private investment and trade, but its advocates\' claims should not be confused with governments universally withdrawing from economic life.',
 [('economic liberalism','Arguments favoring private property, market exchange, and fewer restrictions on economic activity.'),('division of labor','Specialization of productive tasks that can increase output.'),('free trade','Trade conducted with fewer tariffs or discriminatory restrictions.')],
 ['The Wealth of Nations appeared in 1776 and criticized monopolies and mercantilist policy.','States continued to make laws, build institutions, protect property, and intervene selectively, even where market-oriented ideas were influential.'],
 'Distinguish an economic argument from universal historical practice; explain how institutions and state choices shaped capitalism.',
 [('Adam Smith','Developed influential arguments about specialization, markets, and political economy.')],[SOURCES['smith']])
firms=add(5,'apwh-u5-london-companies-finance-global-enterprise','23','Enlightenment Foundations · London','world-event-23-2','Companies, Finance, and Transnational Enterprise','c. 1750–1900',1750,1900,['5.7','5.10'],['ECN','GOV'],
 'Industrial capitalism expanded through joint-stock companies, banks, stock markets, and businesses operating across national borders; institutions pooled capital and linked investors to large enterprises.',
 'Factories required more than inventions: organizations and financial instruments mobilized investment and distributed ownership, profit, and risk.',
 [('joint-stock company','A company whose ownership is divided into shares held by investors.'),('stock market','An institution for trading shares and connecting investment with enterprise.'),('transnational business','A firm conducting linked business operations in more than one country.')],
 ['Banks and shareholding pooled funds for capital-intensive enterprises such as railways and industrial production.','Companies including Hong Kong and Shanghai Banking Corporation, founded in 1865, connected finance with trade across regions.'],
 'Explain how financing and corporate organization enabled industrial growth; distinguish these institutional mechanisms from steam or electricity as technologies.',
 [('Bankers, investors, and company managers','Pooled funds and organized cross-border production, lending, and trade.')],[CED],region='London and global business networks · HSBC originated in Hong Kong and Shanghai, not London')
marx=add(5,'apwh-u5-london-socialism-marx-labor-responses','23','Enlightenment Foundations · London','world-event-23-7','Socialism, Marxism, and Responses to Industrial Inequality','1848–1900',1848,1900,['5.8','5.9','5.10'],['CDI','ECN','SIO'],
 'Socialists criticized inequalities of industrial capitalism; Marx and Engels interpreted history through class conflict and advocated revolutionary transformation, while unions and reformers pursued varied strategies.',
 'Industrial responses differed in goals and means: higher wages or legal reform did not automatically imply support for communist revolution.',
 [('socialism','A diverse family of ideas favoring social or collective control over major economic resources to reduce inequality.'),('Marxism','An analysis of class conflict and capitalism associated with Marx and Engels, linked to the aim of a classless society.'),('trade union','An organization of workers seeking to defend common employment interests; unions were not uniformly revolutionary.')],
 ['Marx and Engels published The Communist Manifesto in London in 1848.','Workers and reformers used unions, strikes, political parties, cooperatives, and legislation, with disagreements over reform versus revolution.'],
 'Compare liberal, socialist, and union responses using specific goals and methods rather than treating all criticism of industry as one ideology.',
 [('Karl Marx and Friedrich Engels','Developed a communist critique of capitalist class relations and called for revolutionary change.')],[SOURCES['marx']])
relink(smith,firms,'Compare arguments favoring market exchange with the financial and legal institutions through which industrial capitalism expanded; ideas alone did not create firms or guarantee free trade.')
relink(marx,'apwh-u5-manchester-urban-class-labor-response','Compare ideological critiques and revolutionary proposals with unions and legislative reform; workers\' organizations adopted diverse, sometimes competing aims.')
relink(marx,smith,'Compare market-oriented political economy with socialist and Marxist critiques of property, inequality, and class; neither represents every policy pursued in the nineteenth century.')
ideology=add(6,'apwh-u6-london-imperial-ideologies-missions','23','Imperial Ideas · London','world-event-23-3','Social Darwinism, Civilizing Missions, and Imperial Claims','c. 1850–1900',1850,1900,['6.1','6.8'],['CDI','GOV','SIO'],
 'Imperial advocates used racial hierarchy, Social Darwinist claims, national prestige, and civilizing or Christian missionary rhetoric to justify expansion; these were contested claims, not objective rankings of peoples.',
 'Ideology helped legitimize unequal power while interacting with economic and strategic interests; missionaries and states did not always share identical aims or methods.',
 [('Social Darwinism','A range of ideologies applying supposed evolutionary competition to societies and using it to rationalize inequality; it is not a scientific proof of racial hierarchy.'),('civilizing mission','A colonial justification claiming that imperial rule would improve subject peoples; the claim obscured coercion and unequal power.')],
 ['Some late-nineteenth-century imperial writers portrayed conquest and racial inequality as evidence of supposed fitness or superiority.','Missionary conversion, schooling, and cultural reform could accompany empire, while colonized people resisted, adapted, or challenged such claims.'],
 'Separate material motives, technological means, and ideological justifications; explain advocates\' claims without endorsing them.',
 [('Imperial writers, missionaries, and colonized critics','Promoted, adapted, or contested justifications for imperial power.')],[SOURCES['darwin']],region='Imperial intellectual and missionary networks · London is a representative publishing and political hub, not the location of all missions')
relink(ideology,'apwh-u6-berlin-industrial-rivalry-rationales','Compare ideological justifications with industrial and strategic motives; they interacted but do not reduce to a single cause of imperial expansion.')
update('apwh-u6-berlin-industrial-rivalry-rationales',3,[CED],examConnection='Build a multicausal argument that distinguishes industrial demand and strategic rivalry from racial, civilizing-mission, and religious justifications; use the linked ideology card for evidence.')

baseline={r['id']:r for u in original for r in u['records']}
for u in units:
    for r in u['records']:
        if r['id'] in baseline and r!=baseline[r['id']]:
            r['authorship']='teacher-revised'
            r['revisionDate']='2026-10-25'
            r['sourceNote']='Original AMSCO locator retained as legacy metadata, not a claim of verbatim verification. Revised wording is a teacher-authored synthesis; use revisionSources and the review ledger for verification.'
            if not r.get('revisionSources'):r['revisionSources']=[CED]
    u['connectionTimelineMode']='main-event' if u['unit']>=4 else None
assert len(by_id)==240
(HERE/'content-corrected.json').write_text(json.dumps(units,ensure_ascii=False,indent=2)+'\n')
(HERE/'correction-ledger.json').write_text(json.dumps({'date':'2026-10-25','originalCount':231,'correctedCount':240,'newIds':[r['id'] for r in by_id.values() if r.get('authorship')=='teacher-created'],'changes':changes,'sources':SOURCES,'ced':CED},ensure_ascii=False,indent=2)+'\n')
print('Generated 240 cards, including 9 new teacher-authored cards; original 231 IDs retained.')
