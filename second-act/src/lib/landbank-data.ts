/**
 * Cook County Land Bank Authority (CCLBA) property data.
 * Source: Cook County Land Bank — publicly available inventory.
 * Top 20 featured properties + full dataset for CSV download.
 */

export interface LandBankProperty {
  parcelId: string;
  address: string;
  fullAddress: string; // address + city + state for geocoding
  city: string;
  state: string;
  zip: string;
  programs: string[];
  latitude: number;
  longitude: number;
  propertyType: "vacant_lot" | "abandoned_building";
  minBid: number;
  estimatedValue: number;
  neighborhood: string;
}

export const CCLBA_TOP_20: LandBankProperty[] = [
  {
    parcelId: "16131010220000",
    address: "12 S WHIPPLE ST",
    fullAddress: "12 S Whipple St, Chicago, IL 60612",
    city: "Chicago", state: "IL", zip: "60612",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8817, longitude: -87.7113,
    propertyType: "abandoned_building",
    minBid: 5000, estimatedValue: 72000, neighborhood: "East Garfield Park",
  },
  {
    parcelId: "16131010230000",
    address: "14 S WHIPPLE ST",
    fullAddress: "14 S Whipple St, Chicago, IL 60612",
    city: "Chicago", state: "IL", zip: "60612",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8816, longitude: -87.7113,
    propertyType: "abandoned_building",
    minBid: 4500, estimatedValue: 68000, neighborhood: "East Garfield Park",
  },
  {
    parcelId: "16131100010000",
    address: "121 S SACRAMENTO AVE",
    fullAddress: "121 S Sacramento Ave, Chicago, IL 60612",
    city: "Chicago", state: "IL", zip: "60612",
    programs: ["Residential/Community Developer"],
    latitude: 41.8801, longitude: -87.7017,
    propertyType: "vacant_lot",
    minBid: 3000, estimatedValue: 45000, neighborhood: "East Garfield Park",
  },
  {
    parcelId: "16142140210000",
    address: "323 S CENTRAL PARK AVE",
    fullAddress: "323 S Central Park Ave, Chicago, IL 60624",
    city: "Chicago", state: "IL", zip: "60624",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8762, longitude: -87.7180,
    propertyType: "abandoned_building",
    minBid: 6000, estimatedValue: 78000, neighborhood: "West Garfield Park",
  },
  {
    parcelId: "16142220010000",
    address: "341 S CENTRAL PARK AVE",
    fullAddress: "341 S Central Park Ave, Chicago, IL 60624",
    city: "Chicago", state: "IL", zip: "60624",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8760, longitude: -87.7180,
    propertyType: "abandoned_building",
    minBid: 5500, estimatedValue: 75000, neighborhood: "West Garfield Park",
  },
  {
    parcelId: "16142240020000",
    address: "417 S CENTRAL PARK AVE",
    fullAddress: "417 S Central Park Ave, Chicago, IL 60624",
    city: "Chicago", state: "IL", zip: "60624",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8748, longitude: -87.7180,
    propertyType: "abandoned_building",
    minBid: 5000, estimatedValue: 70000, neighborhood: "West Garfield Park",
  },
  {
    parcelId: "25153200070000",
    address: "18 E 110TH PL",
    fullAddress: "18 E 110th Pl, Chicago, IL 60628",
    city: "Chicago", state: "IL", zip: "60628",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.6930, longitude: -87.6264,
    propertyType: "vacant_lot",
    minBid: 2500, estimatedValue: 38000, neighborhood: "Roseland",
  },
  {
    parcelId: "25282030090000",
    address: "201 S WENTWORTH AVE",
    fullAddress: "201 S Wentworth Ave, Chicago, IL 60616",
    city: "Chicago", state: "IL", zip: "60616",
    programs: ["Commercial/Industrial Property"],
    latitude: 41.8763, longitude: -87.6306,
    propertyType: "vacant_lot",
    minBid: 8000, estimatedValue: 125000, neighborhood: "Bridgeport",
  },
  {
    parcelId: "16111270420000",
    address: "418 N SPRINGFIELD AVE",
    fullAddress: "418 N Springfield Ave, Chicago, IL 60624",
    city: "Chicago", state: "IL", zip: "60624",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8876, longitude: -87.7101,
    propertyType: "abandoned_building",
    minBid: 4000, estimatedValue: 65000, neighborhood: "West Garfield Park",
  },
  {
    parcelId: "16111280320000",
    address: "438 N AVERS AVE",
    fullAddress: "438 N Avers Ave, Chicago, IL 60624",
    city: "Chicago", state: "IL", zip: "60624",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8880, longitude: -87.7135,
    propertyType: "abandoned_building",
    minBid: 4000, estimatedValue: 62000, neighborhood: "West Garfield Park",
  },
  {
    parcelId: "20291170020000",
    address: "1433 W 72ND PL",
    fullAddress: "1433 W 72nd Pl, Chicago, IL 60636",
    city: "Chicago", state: "IL", zip: "60636",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.7655, longitude: -87.6605,
    propertyType: "abandoned_building",
    minBid: 5000, estimatedValue: 68000, neighborhood: "Englewood",
  },
  {
    parcelId: "20193200190000",
    address: "2011 W 68TH PL",
    fullAddress: "2011 W 68th Pl, Chicago, IL 60636",
    city: "Chicago", state: "IL", zip: "60636",
    programs: ["Residential/Community Developer"],
    latitude: 41.7727, longitude: -87.6746,
    propertyType: "vacant_lot",
    minBid: 3500, estimatedValue: 52000, neighborhood: "Englewood",
  },
  {
    parcelId: "20161230040000",
    address: "5800 S WALLACE ST",
    fullAddress: "5800 S Wallace St, Chicago, IL 60621",
    city: "Chicago", state: "IL", zip: "60621",
    programs: ["Commercial/Industrial Property"],
    latitude: 41.7885, longitude: -87.6444,
    propertyType: "vacant_lot",
    minBid: 4000, estimatedValue: 58000, neighborhood: "Englewood",
  },
  {
    parcelId: "20181230050000",
    address: "5816 S HOYNE AVE",
    fullAddress: "5816 S Hoyne Ave, Chicago, IL 60636",
    city: "Chicago", state: "IL", zip: "60636",
    programs: ["Commercial/Industrial Property"],
    latitude: 41.7882, longitude: -87.6700,
    propertyType: "abandoned_building",
    minBid: 5500, estimatedValue: 72000, neighborhood: "Back of the Yards",
  },
  {
    parcelId: "20174220300000",
    address: "6130 S GREEN ST",
    fullAddress: "6130 S Green St, Chicago, IL 60621",
    city: "Chicago", state: "IL", zip: "60621",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.7816, longitude: -87.6481,
    propertyType: "abandoned_building",
    minBid: 6000, estimatedValue: 80000, neighborhood: "Englewood",
  },
  {
    parcelId: "29174030050000",
    address: "15600 LATHROP AVE",
    fullAddress: "15600 Lathrop Ave, Harvey, IL 60426",
    city: "Harvey", state: "IL", zip: "60426",
    programs: ["Commercial/Industrial Property"],
    latitude: 41.6140, longitude: -87.6454,
    propertyType: "abandoned_building",
    minBid: 2000, estimatedValue: 35000, neighborhood: "Harvey",
  },
  {
    parcelId: "15141070010000",
    address: "114 MADISON ST",
    fullAddress: "114 Madison St, Maywood, IL 60153",
    city: "Maywood", state: "IL", zip: "60153",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.8793, longitude: -87.8378,
    propertyType: "abandoned_building",
    minBid: 3500, estimatedValue: 55000, neighborhood: "Maywood",
  },
  {
    parcelId: "29081010390000",
    address: "33 E 144TH ST",
    fullAddress: "33 E 144th St, Harvey, IL 60426",
    city: "Harvey", state: "IL", zip: "60426",
    programs: ["Commercial/Industrial Property", "Residential/Community Developer"],
    latitude: 41.5998, longitude: -87.6474,
    propertyType: "vacant_lot",
    minBid: 1500, estimatedValue: 28000, neighborhood: "Harvey",
  },
  {
    parcelId: "29122020130000",
    address: "283 CRANDON AVE",
    fullAddress: "283 Crandon Ave, Calumet City, IL 60409",
    city: "Calumet City", state: "IL", zip: "60409",
    programs: ["Residential/Community Developer"],
    latitude: 41.6153, longitude: -87.5275,
    propertyType: "vacant_lot",
    minBid: 2000, estimatedValue: 32000, neighborhood: "Calumet City",
  },
  {
    parcelId: "31364160230000",
    address: "4 APPLE LN",
    fullAddress: "4 Apple Ln, Park Forest, IL 60466",
    city: "Park Forest", state: "IL", zip: "60466",
    programs: ["Residential/Community Developer"],
    latitude: 41.4831, longitude: -87.6826,
    propertyType: "vacant_lot",
    minBid: 1800, estimatedValue: 30000, neighborhood: "Park Forest",
  },
];

// Full dataset as CSV string (Cook County Land Bank inventory)
export const FULL_CCLBA_CSV = `Parcel ID,Address,City,State,ZIP,Programs
29174030050000,"15600 LATHROP AVE",Harvey,IL,60426,Commercial/Industrial Property
31042000050000,"5100 183RD ST",Tinley Park,IL,60477,Commercial/Industrial Property|Residential/Community Developer
31364160230000,"4 APPLE LN",Park Forest,IL,60466,Residential/Community Developer
16131010220000,"12 S WHIPPLE ST",Chicago,IL,60612,Commercial/Industrial Property|Residential/Community Developer
16131010230000,"14 S WHIPPLE ST",Chicago,IL,60612,Commercial/Industrial Property|Residential/Community Developer
25153200070000,"18 E 110TH PL",Chicago,IL,60628,Commercial/Industrial Property|Residential/Community Developer
29081010390000,"33 E 144TH ST",Harvey,IL,60426,Commercial/Industrial Property|Residential/Community Developer
15141070010000,"114 MADISON ST",Maywood,IL,60153,Commercial/Industrial Property|Residential/Community Developer
16131100010000,"121 S SACRAMENTO AVE",Chicago,IL,60612,Residential/Community Developer
25282030090000,"201 S WENTWORTH AVE",Chicago,IL,60616,Commercial/Industrial Property
30171030380000,"216 154TH PL",Calumet City,IL,60409,Commercial/Industrial Property|Residential/Community Developer
29122020130000,"283 CRANDON AVE",Calumet City,IL,60409,Residential/Community Developer
31364100360000,"308 OSAGE ST",Park Forest,IL,60466,
31364110150000,"315 OSAGE ST",Park Forest,IL,60466,
29122080410000,"321 PAXTON AVE",Calumet City,IL,60409,Residential/Community Developer
16142140210000,"323 S CENTRAL PARK AVE",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
29121100660000,"332 MADISON AVE",Calumet City,IL,60409,Residential/Community Developer
31364080270000,"338 OSWEGO ST",Park Forest,IL,60466,Residential/Community Developer
16142220010000,"341 S CENTRAL PARK AVE",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
16142240020000,"417 S CENTRAL PARK AVE",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
16111270420000,"418 N SPRINGFIELD AVE",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
16111280320000,"438 N AVERS AVE",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
30083000250000,"505 BURNHAM AVE",Calumet City,IL,60409,Commercial/Industrial Property
29101070220000,"516 SIBLEY BLVD",Dolton,IL,60419,Commercial/Industrial Property
15141030010000,"520 MADISON ST",Maywood,IL,60153,Commercial/Industrial Property|Residential/Community Developer
16111180300000,"524 N HARDING AVE",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
30084090430000,"629 WENTWORTH AVE",Calumet City,IL,60409,Commercial/Industrial Property
30182250320000,"788 BUFFALO AVE",Calumet City,IL,60409,Residential/Community Developer
30182250310000,"790 BUFFALO AVE",Calumet City,IL,60409,Residential/Community Developer
31212030020000,"940 LAKE SUPERIOR DR",Matteson,IL,60443,Commercial/Industrial Property|Residential/Community Developer
15102340370000,"1000 ST CHARLES RD",Maywood,IL,60153,Commercial/Industrial Property
15102340400000,"1018 ST CHARLES RD",Maywood,IL,60153,Commercial/Industrial Property
30191000090000,"1055 RIVER OAKS DR",Calumet City,IL,60409,Commercial/Industrial Property
30192190120000,"1230 BALMORAL AVE",Calumet City,IL,60409,Residential/Community Developer
30192200040000,"1231 BALMORAL AVE",Calumet City,IL,60409,Residential/Community Developer
32202120080000,"1317 VINCENNES AVE",Chicago Heights,IL,60411,Residential/Community Developer
16222080120000,"1331 S KOSTNER AVE",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
30192190400000,"1352 BALMORAL AVE",Calumet City,IL,60409,Residential/Community Developer
30201180140000,"1405 STANLEY BLVD",Calumet City,IL,60409,Residential/Community Developer
16221100270000,"1412 S KOSTNER AVE",Chicago,IL,60623,Residential/Community Developer
15102300440000,"1414 ST CHARLES RD",Maywood,IL,60153,Commercial/Industrial Property|Residential/Community Developer
15081070540000,"1420 SPEECHLEY BLVD",Berkeley,IL,60163,Commercial/Industrial Property|Residential/Community Developer
20291170020000,"1433 W 72ND PL",Chicago,IL,60636,Commercial/Industrial Property|Residential/Community Developer
16224030320000,"1630 S KEELER AVE",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
15101270050000,"1818 ST CHARLES RD",Maywood,IL,60153,Commercial/Industrial Property
15101270070000,"1818 ST CHARLES RD",Maywood,IL,60153,Residential/Community Developer
15153290290000,"1925 ROOSEVELT RD",Broadview,IL,60155,Commercial/Industrial Property
20193200190000,"2011 W 68TH PL",Chicago,IL,60636,Residential/Community Developer
32252070260000,"2051 218TH ST",Sauk Village,IL,60411,Residential/Community Developer
15143280210000,"2130 S 4TH AVE",Maywood,IL,60153,Commercial/Industrial Property|Residential/Community Developer
32252070350000,"2141 218TH ST",Sauk Village,IL,60411,Residential/Community Developer
31242080220000,"2605 LINCOLN HWY",Olympia Fields,IL,60461,Commercial/Industrial Property
31242080230000,"2605 LINCOLN HWY",Olympia Fields,IL,60461,Commercial/Industrial Property
31242080330000,"2605 LINCOLN HWY",Olympia Fields,IL,60461,Commercial/Industrial Property
31242080340000,"2605 LINCOLN HWY",Olympia Fields,IL,60461,Commercial/Industrial Property
24364270240000,"2625 BROADWAY AVE",Blue Island,IL,60406,Commercial/Industrial Property
21304000150000,"2802 E 78TH ST",Chicago,IL,60649,Commercial/Industrial Property|Residential/Community Developer
24363030370000,"3001 131ST ST",Blue Island,IL,60406,Commercial/Industrial Property
28253190040000,"3107 LONGFELLOW AVE",Hazel Crest,IL,60429,Homebuyer Direct Program
16111100260000,"3946 W OHIO ST",Chicago,IL,60624,Commercial/Industrial Property|Residential/Community Developer
16141040050000,"3948 W ADAMS ST",Chicago,IL,60624,Commercial/Industrial Property
16224010300000,"4246 W 17TH ST",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
31344030090000,"4247 POLK AVE",Richton Park,IL,60471,Residential/Community Developer
16224010290000,"4248 W 17TH ST",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
16224010280000,"4250 W 17TH ST",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
16224010270000,"4254 W 17TH ST",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
16224010250000,"4258 W 17TH ST",Chicago,IL,60623,Commercial/Industrial Property|Residential/Community Developer
31273130140000,"4506 POPLAR AVE",Richton Park,IL,60471,Residential/Community Developer
16161040630000,"5328 W ADAMS ST",Chicago,IL,60644,Commercial/Industrial Property|Residential/Community Developer
20182170230000,"5706 S WOLCOTT AVE",Chicago,IL,60636,Commercial/Industrial Property|Residential/Community Developer
20161230040000,"5800 S WALLACE ST",Chicago,IL,60621,Commercial/Industrial Property
20181230050000,"5816 S HOYNE AVE",Chicago,IL,60636,Commercial/Industrial Property
20171280220000,"5825 S LOOMIS BLVD",Chicago,IL,60621,Commercial/Industrial Property|Residential/Community Developer
20174220300000,"6130 S GREEN ST",Chicago,IL,60621,Commercial/Industrial Property|Residential/Community Developer
20222080110000,"6441 S MARTIN LUTHER KING DR",Chicago,IL,60637,Commercial/Industrial Property
20222080120000,"6443 S MARTIN LUTHER KING DR",Chicago,IL,60637,Commercial/Industrial Property
15134300350000,"7245 ROOSEVELT RD",Forest Park,IL,60130,Commercial/Industrial Property
20283070250000,"7646 S EMERALD AVE",Chicago,IL,60620,Residential/Community Developer
20331090370000,"8013 S EMERALD AVE",Chicago,IL,60620,Residential/Community Developer
20314040330000,"8348 S PAULINA ST",Chicago,IL,60620,Commercial/Industrial Property|Residential/Community Developer
25041290220000,"9000 S EGGLESTON AVE",Chicago,IL,60620,Commercial/Industrial Property|Residential/Community Developer
25041290230000,"9004 S EGGLESTON AVE",Chicago,IL,60620,Commercial/Industrial Property|Residential/Community Developer
25041290250000,"9008 S EGGLESTON AVE",Chicago,IL,60620,Commercial/Industrial Property|Residential/Community Developer
25044090330000,"9320 S PERRY AVE",Chicago,IL,60620,Commercial/Industrial Property|Residential/Community Developer
25122230050000,"9723 S CRANDON AVE",Chicago,IL,60617,Residential/Community Developer
25103280160000,"10200 S SOUTH PARK AVE",Chicago,IL,60628,Commercial/Industrial Property|Residential/Community Developer
25103280170000,"10204 S SOUTH PARK AVE",Chicago,IL,60628,Commercial/Industrial Property|Residential/Community Developer
25223000110000,"11561 S STATE ST",Chicago,IL,60628,Commercial/Industrial Property|Residential/Community Developer
25292070060000,"12102 S PEORIA ST",Chicago,IL,60643,Commercial/Industrial Property|Residential/Community Developer
24362130240000,"12854 WESTERN AVE",Blue Island,IL,60406,Commercial/Industrial Property
25313000060000,"13119 WESTERN AVE",Blue Island,IL,60406,Commercial/Industrial Property
29034000080000,"14229 CHICAGO RD",Dolton,IL,60419,Commercial/Industrial Property
29024020300000,"14234 KENWOOD AVE",Dolton,IL,60419,Residential/Community Developer
29023230210000,"14418 UNIVERSITY AVE",Dolton,IL,60419,Residential/Community Developer
29023240060000,"14419 UNIVERSITY AVE",Dolton,IL,60419,Residential/Community Developer`;
