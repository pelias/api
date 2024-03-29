const _ = require('lodash');

const byISO2 = {'AF':{'country':'Afghanistan','alpha2':'AF','alpha3':'AFG','numeric':'004'},
                'AX':{'country':'Åland Islands','alpha2':'AX','alpha3':'ALA','numeric':'248'},
                'AL':{'country':'Albania','alpha2':'AL','alpha3':'ALB','numeric':'008'},
                'DZ':{'country':'Algeria','alpha2':'DZ','alpha3':'DZA','numeric':'012'},
                'AS':{'country':'American Samoa','alpha2':'AS','alpha3':'ASM','numeric':'016'},
                'AD':{'country':'Andorra','alpha2':'AD','alpha3':'AND','numeric':'020'},
                'AO':{'country':'Angola','alpha2':'AO','alpha3':'AGO','numeric':'024'},
                'AI':{'country':'Anguilla','alpha2':'AI','alpha3':'AIA','numeric':'660'},
                'AQ':{'country':'Antarctica','alpha2':'AQ','alpha3':'ATA','numeric':'010'},
                'AG':{'country':'Antigua and Barbuda','alpha2':'AG','alpha3':'ATG','numeric':'028'},
                'AR':{'country':'Argentina','alpha2':'AR','alpha3':'ARG','numeric':'032'},
                'AM':{'country':'Armenia','alpha2':'AM','alpha3':'ARM','numeric':'051'},
                'AW':{'country':'Aruba','alpha2':'AW','alpha3':'ABW','numeric':'533'},
                'AU':{'country':'Australia','alpha2':'AU','alpha3':'AUS','numeric':'036'},
                'AT':{'country':'Austria','alpha2':'AT','alpha3':'AUT','numeric':'040'},
                'AZ':{'country':'Azerbaijan','alpha2':'AZ','alpha3':'AZE','numeric':'031'},
                'BS':{'country':'Bahamas','alpha2':'BS','alpha3':'BHS','numeric':'044'},
                'BH':{'country':'Bahrain','alpha2':'BH','alpha3':'BHR','numeric':'048'},
                'BD':{'country':'Bangladesh','alpha2':'BD','alpha3':'BGD','numeric':'050'},
                'BB':{'country':'Barbados','alpha2':'BB','alpha3':'BRB','numeric':'052'},
                'BY':{'country':'Belarus','alpha2':'BY','alpha3':'BLR','numeric':'112'},
                'BE':{'country':'Belgium','alpha2':'BE','alpha3':'BEL','numeric':'056'},
                'BZ':{'country':'Belize','alpha2':'BZ','alpha3':'BLZ','numeric':'084'},
                'BJ':{'country':'Benin','alpha2':'BJ','alpha3':'BEN','numeric':'204'},
                'BM':{'country':'Bermuda','alpha2':'BM','alpha3':'BMU','numeric':'060'},
                'BT':{'country':'Bhutan','alpha2':'BT','alpha3':'BTN','numeric':'064'},
                'BO':{'country':'Bolivia','alpha2':'BO','alpha3':'BOL','numeric':'068'},
                'BQ':{'country':'Bonaire, Sint Eustatius and Saba','alpha2':'BQ','alpha3':'BES','numeric':'535'},
                'BA':{'country':'Bosnia and Herzegovina','alpha2':'BA','alpha3':'BIH','numeric':'070'},
                'BW':{'country':'Botswana','alpha2':'BW','alpha3':'BWA','numeric':'072'},
                'BV':{'country':'Bouvet Island','alpha2':'BV','alpha3':'BVT','numeric':'074'},
                'BR':{'country':'Brazil','alpha2':'BR','alpha3':'BRA','numeric':'076'},
                'IO':{'country':'British Indian Ocean Territory','alpha2':'IO','alpha3':'IOT','numeric':'086'},
                'BN':{'country':'Brunei Darussalam','alpha2':'BN','alpha3':'BRN','numeric':'096'},
                'BG':{'country':'Bulgaria','alpha2':'BG','alpha3':'BGR','numeric':'100'},
                'BF':{'country':'Burkina Faso','alpha2':'BF','alpha3':'BFA','numeric':'854'},
                'BI':{'country':'Burundi','alpha2':'BI','alpha3':'BDI','numeric':'108'},
                'CV':{'country':'Cabo Verde','alpha2':'CV','alpha3':'CPV','numeric':'132'},
                'KH':{'country':'Cambodia','alpha2':'KH','alpha3':'KHM','numeric':'116'},
                'CM':{'country':'Cameroon','alpha2':'CM','alpha3':'CMR','numeric':'120'},
                'CA':{'country':'Canada','alpha2':'CA','alpha3':'CAN','numeric':'124'},
                'KY':{'country':'Cayman Islands','alpha2':'KY','alpha3':'CYM','numeric':'136'},
                'CF':{'country':'Central African Republic','alpha2':'CF','alpha3':'CAF','numeric':'140'},
                'TD':{'country':'Chad','alpha2':'TD','alpha3':'TCD','numeric':'148'},
                'CL':{'country':'Chile','alpha2':'CL','alpha3':'CHL','numeric':'152'},
                'CN':{'country':'China','alpha2':'CN','alpha3':'CHN','numeric':'156'},
                'CX':{'country':'Christmas Island','alpha2':'CX','alpha3':'CXR','numeric':'162'},
                'CC':{'country':'Cocos Islands','alpha2':'CC','alpha3':'CCK','numeric':'166'},
                'CO':{'country':'Colombia','alpha2':'CO','alpha3':'COL','numeric':'170'},
                'KM':{'country':'Comoros','alpha2':'KM','alpha3':'COM','numeric':'174'},
                'CG':{'country':'Congo','alpha2':'CG','alpha3':'COG','numeric':'178'},
                'CD':{'country':'Congo','alpha2':'CD','alpha3':'COD','numeric':'180'},
                'CK':{'country':'Cook Islands','alpha2':'CK','alpha3':'COK','numeric':'184'},
                'CR':{'country':'Costa Rica','alpha2':'CR','alpha3':'CRI','numeric':'188'},
                'CI':{'country':'Côte d\'Ivoire','alpha2':'CI','alpha3':'CIV','numeric':'384'},
                'HR':{'country':'Croatia','alpha2':'HR','alpha3':'HRV','numeric':'191'},
                'CU':{'country':'Cuba','alpha2':'CU','alpha3':'CUB','numeric':'192'},
                'CW':{'country':'Curaçao','alpha2':'CW','alpha3':'CUW','numeric':'531'},
                'CY':{'country':'Cyprus','alpha2':'CY','alpha3':'CYP','numeric':'196'},
                'CZ':{'country':'Czech Republic','alpha2':'CZ','alpha3':'CZE','numeric':'203'},
                'DK':{'country':'Denmark','alpha2':'DK','alpha3':'DNK','numeric':'208'},
                'DJ':{'country':'Djibouti','alpha2':'DJ','alpha3':'DJI','numeric':'262'},
                'DM':{'country':'Dominica','alpha2':'DM','alpha3':'DMA','numeric':'212'},
                'DO':{'country':'Dominican Republic','alpha2':'DO','alpha3':'DOM','numeric':'214'},
                'EC':{'country':'Ecuador','alpha2':'EC','alpha3':'ECU','numeric':'218'},
                'EG':{'country':'Egypt','alpha2':'EG','alpha3':'EGY','numeric':'818'},
                'SV':{'country':'El Salvador','alpha2':'SV','alpha3':'SLV','numeric':'222'},
                'GQ':{'country':'Equatorial Guinea','alpha2':'GQ','alpha3':'GNQ','numeric':'226'},
                'ER':{'country':'Eritrea','alpha2':'ER','alpha3':'ERI','numeric':'232'},
                'EE':{'country':'Estonia','alpha2':'EE','alpha3':'EST','numeric':'233'},
                'ET':{'country':'Ethiopia','alpha2':'ET','alpha3':'ETH','numeric':'231'},
                'FK':{'country':'Falkland Islands','alpha2':'FK','alpha3':'FLK','numeric':'238'},
                'FO':{'country':'Faroe Islands','alpha2':'FO','alpha3':'FRO','numeric':'234'},
                'FJ':{'country':'Fiji','alpha2':'FJ','alpha3':'FJI','numeric':'242'},
                'FI':{'country':'Finland','alpha2':'FI','alpha3':'FIN','numeric':'246'},
                'FR':{'country':'France','alpha2':'FR','alpha3':'FRA','numeric':'250'},
                'GF':{'country':'French Guiana','alpha2':'GF','alpha3':'GUF','numeric':'254'},
                'PF':{'country':'French Polynesia','alpha2':'PF','alpha3':'PYF','numeric':'258'},
                'TF':{'country':'French Southern Territories','alpha2':'TF','alpha3':'ATF','numeric':'260'},
                'GA':{'country':'Gabon','alpha2':'GA','alpha3':'GAB','numeric':'266'},
                'GM':{'country':'Gambia','alpha2':'GM','alpha3':'GMB','numeric':'270'},
                'GE':{'country':'Georgia','alpha2':'GE','alpha3':'GEO','numeric':'268'},
                'DE':{'country':'Germany','alpha2':'DE','alpha3':'DEU','numeric':'276'},
                'GH':{'country':'Ghana','alpha2':'GH','alpha3':'GHA','numeric':'288'},
                'GI':{'country':'Gibraltar','alpha2':'GI','alpha3':'GIB','numeric':'292'},
                'GR':{'country':'Greece','alpha2':'GR','alpha3':'GRC','numeric':'300'},
                'GL':{'country':'Greenland','alpha2':'GL','alpha3':'GRL','numeric':'304'},
                'GD':{'country':'Grenada','alpha2':'GD','alpha3':'GRD','numeric':'308'},
                'GP':{'country':'Guadeloupe','alpha2':'GP','alpha3':'GLP','numeric':'312'},
                'GU':{'country':'Guam','alpha2':'GU','alpha3':'GUM','numeric':'316'},
                'GT':{'country':'Guatemala','alpha2':'GT','alpha3':'GTM','numeric':'320'},
                'GG':{'country':'Guernsey','alpha2':'GG','alpha3':'GGY','numeric':'831'},
                'GN':{'country':'Guinea','alpha2':'GN','alpha3':'GIN','numeric':'324'},
                'GW':{'country':'Guinea-Bissau','alpha2':'GW','alpha3':'GNB','numeric':'624'},
                'GY':{'country':'Guyana','alpha2':'GY','alpha3':'GUY','numeric':'328'},
                'HT':{'country':'Haiti','alpha2':'HT','alpha3':'HTI','numeric':'332'},
                'HM':{'country':'Heard Island and McDonald Islands','alpha2':'HM','alpha3':'HMD','numeric':'334'},
                'VA':{'country':'Holy See','alpha2':'VA','alpha3':'VAT','numeric':'336'},
                'HN':{'country':'Honduras','alpha2':'HN','alpha3':'HND','numeric':'340'},
                'HK':{'country':'Hong Kong','alpha2':'HK','alpha3':'HKG','numeric':'344'},
                'HU':{'country':'Hungary','alpha2':'HU','alpha3':'HUN','numeric':'348'},
                'IS':{'country':'Iceland','alpha2':'IS','alpha3':'ISL','numeric':'352'},
                'IN':{'country':'India','alpha2':'IN','alpha3':'IND','numeric':'356'},
                'ID':{'country':'Indonesia','alpha2':'ID','alpha3':'IDN','numeric':'360'},
                'IR':{'country':'Islamic Republic of Iran','alpha2':'IR','alpha3':'IRN','numeric':'364'},
                'IQ':{'country':'Iraq','alpha2':'IQ','alpha3':'IRQ','numeric':'368'},
                'IE':{'country':'Ireland','alpha2':'IE','alpha3':'IRL','numeric':'372'},
                'IM':{'country':'Isle of Man','alpha2':'IM','alpha3':'IMN','numeric':'833'},
                'IL':{'country':'Israel','alpha2':'IL','alpha3':'ISR','numeric':'376'},
                'IT':{'country':'Italy','alpha2':'IT','alpha3':'ITA','numeric':'380'},
                'JM':{'country':'Jamaica','alpha2':'JM','alpha3':'JAM','numeric':'388'},
                'JP':{'country':'Japan','alpha2':'JP','alpha3':'JPN','numeric':'392'},
                'JE':{'country':'Jersey','alpha2':'JE','alpha3':'JEY','numeric':'832'},
                'JO':{'country':'Jordan','alpha2':'JO','alpha3':'JOR','numeric':'400'},
                'KZ':{'country':'Kazakhstan','alpha2':'KZ','alpha3':'KAZ','numeric':'398'},
                'KE':{'country':'Kenya','alpha2':'KE','alpha3':'KEN','numeric':'404'},
                'KI':{'country':'Kiribati','alpha2':'KI','alpha3':'KIR','numeric':'296'},
                'KP':{'country':'Democratic People\'s Republic of Korea','alpha2':'KP','alpha3':'PRK','numeric':'408'},
                'KR':{'country':'Republic of Korea','alpha2':'KR','alpha3':'KOR','numeric':'410'},
                'KW':{'country':'Kuwait','alpha2':'KW','alpha3':'KWT','numeric':'414'},
                'KG':{'country':'Kyrgyzstan','alpha2':'KG','alpha3':'KGZ','numeric':'417'},
                'LA':{'country':'Lao People\'s Democratic Republic','alpha2':'LA','alpha3':'LAO','numeric':'418'},
                'LV':{'country':'Latvia','alpha2':'LV','alpha3':'LVA','numeric':'428'},
                'LB':{'country':'Lebanon','alpha2':'LB','alpha3':'LBN','numeric':'422'},
                'LS':{'country':'Lesotho','alpha2':'LS','alpha3':'LSO','numeric':'426'},
                'LR':{'country':'Liberia','alpha2':'LR','alpha3':'LBR','numeric':'430'},
                'LY':{'country':'Libya','alpha2':'LY','alpha3':'LBY','numeric':'434'},
                'LI':{'country':'Liechtenstein','alpha2':'LI','alpha3':'LIE','numeric':'438'},
                'LT':{'country':'Lithuania','alpha2':'LT','alpha3':'LTU','numeric':'440'},
                'LU':{'country':'Luxembourg','alpha2':'LU','alpha3':'LUX','numeric':'442'},
                'MO':{'country':'Macao','alpha2':'MO','alpha3':'MAC','numeric':'446'},
                'MK':{'country':'Macedonia','alpha2':'MK','alpha3':'MKD','numeric':'807'},
                'MG':{'country':'Madagascar','alpha2':'MG','alpha3':'MDG','numeric':'450'},
                'MW':{'country':'Malawi','alpha2':'MW','alpha3':'MWI','numeric':'454'},
                'MY':{'country':'Malaysia','alpha2':'MY','alpha3':'MYS','numeric':'458'},
                'MV':{'country':'Maldives','alpha2':'MV','alpha3':'MDV','numeric':'462'},
                'ML':{'country':'Mali','alpha2':'ML','alpha3':'MLI','numeric':'466'},
                'MT':{'country':'Malta','alpha2':'MT','alpha3':'MLT','numeric':'470'},
                'MH':{'country':'Marshall Islands','alpha2':'MH','alpha3':'MHL','numeric':'584'},
                'MQ':{'country':'Martinique','alpha2':'MQ','alpha3':'MTQ','numeric':'474'},
                'MR':{'country':'Mauritania','alpha2':'MR','alpha3':'MRT','numeric':'478'},
                'MU':{'country':'Mauritius','alpha2':'MU','alpha3':'MUS','numeric':'480'},
                'YT':{'country':'Mayotte','alpha2':'YT','alpha3':'MYT','numeric':'175'},
                'MX':{'country':'Mexico','alpha2':'MX','alpha3':'MEX','numeric':'484'},
                'FM':{'country':'Federated States of Micronesia','alpha2':'FM','alpha3':'FSM','numeric':'583'},
                'MD':{'country':'Republic of Moldova','alpha2':'MD','alpha3':'MDA','numeric':'498'},
                'MC':{'country':'Monaco','alpha2':'MC','alpha3':'MCO','numeric':'492'},
                'MN':{'country':'Mongolia','alpha2':'MN','alpha3':'MNG','numeric':'496'},
                'ME':{'country':'Montenegro','alpha2':'ME','alpha3':'MNE','numeric':'499'},
                'MS':{'country':'Montserrat','alpha2':'MS','alpha3':'MSR','numeric':'500'},
                'MA':{'country':'Morocco','alpha2':'MA','alpha3':'MAR','numeric':'504'},
                'MZ':{'country':'Mozambique','alpha2':'MZ','alpha3':'MOZ','numeric':'508'},
                'MM':{'country':'Myanmar','alpha2':'MM','alpha3':'MMR','numeric':'104'},
                'NA':{'country':'Namibia','alpha2':'NA','alpha3':'NAM','numeric':'516'},
                'NR':{'country':'Nauru','alpha2':'NR','alpha3':'NRU','numeric':'520'},
                'NP':{'country':'Nepal','alpha2':'NP','alpha3':'NPL','numeric':'524'},
                'NL':{'country':'Netherlands','alpha2':'NL','alpha3':'NLD','numeric':'528'},
                'NC':{'country':'New Caledonia','alpha2':'NC','alpha3':'NCL','numeric':'540'},
                'NZ':{'country':'New Zealand','alpha2':'NZ','alpha3':'NZL','numeric':'554'},
                'NI':{'country':'Nicaragua','alpha2':'NI','alpha3':'NIC','numeric':'558'},
                'NE':{'country':'Niger','alpha2':'NE','alpha3':'NER','numeric':'562'},
                'NG':{'country':'Nigeria','alpha2':'NG','alpha3':'NGA','numeric':'566'},
                'NU':{'country':'Niue','alpha2':'NU','alpha3':'NIU','numeric':'570'},
                'NF':{'country':'Norfolk Island','alpha2':'NF','alpha3':'NFK','numeric':'574'},
                'MP':{'country':'Northern Mariana Islands','alpha2':'MP','alpha3':'MNP','numeric':'580'},
                'NO':{'country':'Norway','alpha2':'NO','alpha3':'NOR','numeric':'578'},
                'OM':{'country':'Oman','alpha2':'OM','alpha3':'OMN','numeric':'512'},
                'PK':{'country':'Pakistan','alpha2':'PK','alpha3':'PAK','numeric':'586'},
                'PW':{'country':'Palau','alpha2':'PW','alpha3':'PLW','numeric':'585'},
                'PS':{'country':'State of Palestine','alpha2':'PS','alpha3':'PSE','numeric':'275'},
                'PA':{'country':'Panama','alpha2':'PA','alpha3':'PAN','numeric':'591'},
                'PG':{'country':'Papua New Guinea','alpha2':'PG','alpha3':'PNG','numeric':'598'},
                'PY':{'country':'Paraguay','alpha2':'PY','alpha3':'PRY','numeric':'600'},
                'PE':{'country':'Peru','alpha2':'PE','alpha3':'PER','numeric':'604'},
                'PH':{'country':'Philippines','alpha2':'PH','alpha3':'PHL','numeric':'608'},
                'PN':{'country':'Pitcairn','alpha2':'PN','alpha3':'PCN','numeric':'612'},
                'PL':{'country':'Poland','alpha2':'PL','alpha3':'POL','numeric':'616'},
                'PT':{'country':'Portugal','alpha2':'PT','alpha3':'PRT','numeric':'620'},
                'PR':{'country':'Puerto Rico','alpha2':'PR','alpha3':'PRI','numeric':'630'},
                'QA':{'country':'Qatar','alpha2':'QA','alpha3':'QAT','numeric':'634'},
                'RE':{'country':'Réunion','alpha2':'RE','alpha3':'REU','numeric':'638'},
                'RO':{'country':'Romania','alpha2':'RO','alpha3':'ROU','numeric':'642'},
                'RU':{'country':'Russian Federation','alpha2':'RU','alpha3':'RUS','numeric':'643'},
                'RW':{'country':'Rwanda','alpha2':'RW','alpha3':'RWA','numeric':'646'},
                'BL':{'country':'Saint Barthélemy','alpha2':'BL','alpha3':'BLM','numeric':'652'},
                'SH':{'country':'Saint Helena, Ascension and Tristan da Cunha','alpha2':'SH','alpha3':'SHN','numeric':'654'},
                'KN':{'country':'Saint Kitts and Nevis','alpha2':'KN','alpha3':'KNA','numeric':'659'},
                'LC':{'country':'Saint Lucia','alpha2':'LC','alpha3':'LCA','numeric':'662'},
                'MF':{'country':'Saint Martin','alpha2':'MF','alpha3':'MAF','numeric':'663'},
                'PM':{'country':'Saint Pierre and Miquelon','alpha2':'PM','alpha3':'SPM','numeric':'666'},
                'VC':{'country':'Saint Vincent and the Grenadines','alpha2':'VC','alpha3':'VCT','numeric':'670'},
                'WS':{'country':'Samoa','alpha2':'WS','alpha3':'WSM','numeric':'882'},
                'SM':{'country':'San Marino','alpha2':'SM','alpha3':'SMR','numeric':'674'},
                'ST':{'country':'Sao Tome and Principe','alpha2':'ST','alpha3':'STP','numeric':'678'},
                'SA':{'country':'Saudi Arabia','alpha2':'SA','alpha3':'SAU','numeric':'682'},
                'SN':{'country':'Senegal','alpha2':'SN','alpha3':'SEN','numeric':'686'},
                'RS':{'country':'Serbia','alpha2':'RS','alpha3':'SRB','numeric':'688'},
                'SC':{'country':'Seychelles','alpha2':'SC','alpha3':'SYC','numeric':'690'},
                'SL':{'country':'Sierra Leone','alpha2':'SL','alpha3':'SLE','numeric':'694'},
                'SG':{'country':'Singapore','alpha2':'SG','alpha3':'SGP','numeric':'702'},
                'SX':{'country':'Sint Maarten','alpha2':'SX','alpha3':'SXM','numeric':'534'},
                'SK':{'country':'Slovakia','alpha2':'SK','alpha3':'SVK','numeric':'703'},
                'SI':{'country':'Slovenia','alpha2':'SI','alpha3':'SVN','numeric':'705'},
                'SB':{'country':'Solomon Islands','alpha2':'SB','alpha3':'SLB','numeric':'090'},
                'SO':{'country':'Somalia','alpha2':'SO','alpha3':'SOM','numeric':'706'},
                'ZA':{'country':'South Africa','alpha2':'ZA','alpha3':'ZAF','numeric':'710'},
                'GS':{'country':'South Georgia and the South Sandwich Islands','alpha2':'GS','alpha3':'SGS','numeric':'239'},
                'SS':{'country':'South Sudan','alpha2':'SS','alpha3':'SSD','numeric':'728'},
                'ES':{'country':'Spain','alpha2':'ES','alpha3':'ESP','numeric':'724'},
                'LK':{'country':'Sri Lanka','alpha2':'LK','alpha3':'LKA','numeric':'144'},
                'SD':{'country':'Sudan','alpha2':'SD','alpha3':'SDN','numeric':'729'},
                'SR':{'country':'Suriname','alpha2':'SR','alpha3':'SUR','numeric':'740'},
                'SJ':{'country':'Svalbard and Jan Mayen','alpha2':'SJ','alpha3':'SJM','numeric':'744'},
                'SZ':{'country':'Swaziland','alpha2':'SZ','alpha3':'SWZ','numeric':'748'},
                'SE':{'country':'Sweden','alpha2':'SE','alpha3':'SWE','numeric':'752'},
                'CH':{'country':'Switzerland','alpha2':'CH','alpha3':'CHE','numeric':'756'},
                'SY':{'country':'Syrian Arab Republic','alpha2':'SY','alpha3':'SYR','numeric':'760'},
                'TW':{'country':'Taiwan, Province of China','alpha2':'TW','alpha3':'TWN','numeric':'158'},
                'TJ':{'country':'Tajikistan','alpha2':'TJ','alpha3':'TJK','numeric':'762'},
                'TZ':{'country':'United Republic of Tanzania','alpha2':'TZ','alpha3':'TZA','numeric':'834'},
                'TH':{'country':'Thailand','alpha2':'TH','alpha3':'THA','numeric':'764'},
                'TL':{'country':'Timor-Leste','alpha2':'TL','alpha3':'TLS','numeric':'626'},
                'TG':{'country':'Togo','alpha2':'TG','alpha3':'TGO','numeric':'768'},
                'TK':{'country':'Tokelau','alpha2':'TK','alpha3':'TKL','numeric':'772'},
                'TO':{'country':'Tonga','alpha2':'TO','alpha3':'TON','numeric':'776'},
                'TT':{'country':'Trinidad and Tobago','alpha2':'TT','alpha3':'TTO','numeric':'780'},
                'TN':{'country':'Tunisia','alpha2':'TN','alpha3':'TUN','numeric':'788'},
                'TR':{'country':'Turkey','alpha2':'TR','alpha3':'TUR','numeric':'792'},
                'TM':{'country':'Turkmenistan','alpha2':'TM','alpha3':'TKM','numeric':'795'},
                'TC':{'country':'Turks and Caicos Islands','alpha2':'TC','alpha3':'TCA','numeric':'796'},
                'TV':{'country':'Tuvalu','alpha2':'TV','alpha3':'TUV','numeric':'798'},
                'UG':{'country':'Uganda','alpha2':'UG','alpha3':'UGA','numeric':'800'},
                'UA':{'country':'Ukraine','alpha2':'UA','alpha3':'UKR','numeric':'804'},
                'AE':{'country':'United Arab Emirates','alpha2':'AE','alpha3':'ARE','numeric':'784'},
                'GB':{'country':'United Kingdom of Great Britain and Northern Ireland','alpha2':'GB','alpha3':'GBR','numeric':'826'},
                'US':{'country':'United States of America','alpha2':'US','alpha3':'USA','numeric':'840'},
                'UM':{'country':'United States Minor Outlying Islands','alpha2':'UM','alpha3':'UMI','numeric':'581'},
                'UY':{'country':'Uruguay','alpha2':'UY','alpha3':'URY','numeric':'858'},
                'UZ':{'country':'Uzbekistan','alpha2':'UZ','alpha3':'UZB','numeric':'860'},
                'VU':{'country':'Vanuatu','alpha2':'VU','alpha3':'VUT','numeric':'548'},
                'VE':{'country':'Venezuela (Bolivarian Republic of)','alpha2':'VE','alpha3':'VEN','numeric':'862'},
                'VN':{'country':'Viet Nam','alpha2':'VN','alpha3':'VNM','numeric':'704'},
                'VG':{'country':'Virgin Islands','alpha2':'VG','alpha3':'VGB','numeric':'092'},
                'VI':{'country':'Virgin Islands','alpha2':'VI','alpha3':'VIR','numeric':'850'},
                'WF':{'country':'Wallis and Futuna','alpha2':'WF','alpha3':'WLF','numeric':'876'},
                'EH':{'country':'Western Sahara','alpha2':'EH','alpha3':'ESH','numeric':'732'},
                'YE':{'country':'Yemen','alpha2':'YE','alpha3':'YEM','numeric':'887'},
                'ZM':{'country':'Zambia','alpha2':'ZM','alpha3':'ZMB','numeric':'894'},
                'ZW':{'country':'Zimbabwe','alpha2':'ZW','alpha3':'ZWE','numeric':'716'}};

const iso3to2 = {'AFG':'AF','ALA':'AX','ALB':'AL','DZA':'DZ','ASM':'AS','AND':'AD','AGO':'AO',
                 'AIA':'AI','ATA':'AQ','ATG':'AG','ARG':'AR','ARM':'AM','ABW':'AW','AUS':'AU',
                 'AUT':'AT','AZE':'AZ','BHS':'BS','BHR':'BH','BGD':'BD','BRB':'BB','BLR':'BY',
                 'BEL':'BE','BLZ':'BZ','BEN':'BJ','BMU':'BM','BTN':'BT','BOL':'BO','BES':'BQ',
                 'BIH':'BA','BWA':'BW','BVT':'BV','BRA':'BR','IOT':'IO','BRN':'BN','BGR':'BG',
                 'BFA':'BF','BDI':'BI','CPV':'CV','KHM':'KH','CMR':'CM','CAN':'CA','CYM':'KY',
                 'CAF':'CF','TCD':'TD','CHL':'CL','CHN':'CN','CXR':'CX','CCK':'CC','COL':'CO',
                 'COM':'KM','COG':'CG','COD':'CD','COK':'CK','CRI':'CR','CIV':'CI','HRV':'HR',
                 'CUB':'CU','CUW':'CW','CYP':'CY','CZE':'CZ','DNK':'DK','DJI':'DJ','DMA':'DM',
                 'DOM':'DO','ECU':'EC','EGY':'EG','SLV':'SV','GNQ':'GQ','ERI':'ER','EST':'EE',
                 'ETH':'ET','FLK':'FK','FRO':'FO','FJI':'FJ','FIN':'FI','FRA':'FR','GUF':'GF',
                 'PYF':'PF','ATF':'TF','GAB':'GA','GMB':'GM','GEO':'GE','DEU':'DE','GHA':'GH',
                 'GIB':'GI','GRC':'GR','GRL':'GL','GRD':'GD','GLP':'GP','GUM':'GU','GTM':'GT',
                 'GGY':'GG','GIN':'GN','GNB':'GW','GUY':'GY','HTI':'HT','HMD':'HM','VAT':'VA',
                 'HND':'HN','HKG':'HK','HUN':'HU','ISL':'IS','IND':'IN','IDN':'ID','IRN':'IR',
                 'IRQ':'IQ','IRL':'IE','IMN':'IM','ISR':'IL','ITA':'IT','JAM':'JM','JPN':'JP',
                 'JEY':'JE','JOR':'JO','KAZ':'KZ','KEN':'KE','KIR':'KI','PRK':'KP','KOR':'KR',
                 'KWT':'KW','KGZ':'KG','LAO':'LA','LVA':'LV','LBN':'LB','LSO':'LS','LBR':'LR',
                 'LBY':'LY','LIE':'LI','LTU':'LT','LUX':'LU','MAC':'MO','MKD':'MK','MDG':'MG',
                 'MWI':'MW','MYS':'MY','MDV':'MV','MLI':'ML','MLT':'MT','MHL':'MH','MTQ':'MQ',
                 'MRT':'MR','MUS':'MU','MYT':'YT','MEX':'MX','FSM':'FM','MDA':'MD','MCO':'MC',
                 'MNG':'MN','MNE':'ME','MSR':'MS','MAR':'MA','MOZ':'MZ','MMR':'MM','NAM':'NA',
                 'NRU':'NR','NPL':'NP','NLD':'NL','NCL':'NC','NZL':'NZ','NIC':'NI','NER':'NE',
                 'NGA':'NG','NIU':'NU','NFK':'NF','MNP':'MP','NOR':'NO','OMN':'OM','PAK':'PK',
                 'PLW':'PW','PSE':'PS','PAN':'PA','PNG':'PG','PRY':'PY','PER':'PE','PHL':'PH',
                 'PCN':'PN','POL':'PL','PRT':'PT','PRI':'PR','QAT':'QA','REU':'RE','ROU':'RO',
                 'RUS':'RU','RWA':'RW','BLM':'BL','SHN':'SH','KNA':'KN','LCA':'LC','MAF':'MF',
                 'SPM':'PM','VCT':'VC','WSM':'WS','SMR':'SM','STP':'ST','SAU':'SA','SEN':'SN',
                 'SRB':'RS','SYC':'SC','SLE':'SL','SGP':'SG','SXM':'SX','SVK':'SK','SVN':'SI',
                 'SLB':'SB','SOM':'SO','ZAF':'ZA','SGS':'GS','SSD':'SS','ESP':'ES','LKA':'LK',
                 'SDN':'SD','SUR':'SR','SJM':'SJ','SWZ':'SZ','SWE':'SE','CHE':'CH','SYR':'SY',
                 'TWN':'TW','TJK':'TJ','TZA':'TZ','THA':'TH','TLS':'TL','TGO':'TG','TKL':'TK',
                 'TON':'TO','TTO':'TT','TUN':'TN','TUR':'TR','TKM':'TM','TCA':'TC','TUV':'TV',
                 'UGA':'UG','UKR':'UA','ARE':'AE','GBR':'GB','USA':'US','UMI':'UM','URY':'UY',
                 'UZB':'UZ','VUT':'VU','VEN':'VE','VNM':'VN','VGB':'VG','VIR':'VI','WLF':'WF',
                 'ESH':'EH','YEM':'YE','ZMB':'ZM','ZWE':'ZW'};


function isISO2Code(code) {
  return byISO2[_.toUpper(code)] !== undefined;
}

function isISO3Code(code) {
  return iso3to2[_.toUpper(code)] !== undefined;
}

function convertISO2ToISO3(code) {
  const country = byISO2[_.toUpper(code)];
  if (country !== undefined) {
    return country.alpha3;
  }
}

function convertISO3ToISO2(code) {
  return iso3to2[_.toUpper(code)];
}

function iso3Code(code) {
  if (isISO2Code(code)) {
    return convertISO2ToISO3(code);
  } else if (isISO3Code(code)) {
    return _.toUpper(code);
  }
}

function info(code) {
  if (isISO3Code(code)) {
    code = convertISO3ToISO2(code);
  }
  return _.get(byISO2, _.toUpper(code));
}

module.exports = {
  isISO2Code,
  isISO3Code,
  convertISO2ToISO3,
  convertISO3ToISO2,
  iso3Code,
  info
};
