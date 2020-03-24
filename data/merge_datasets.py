import pandas as pd
import geopandas as gpd
import json

flags = pd.read_csv('flag_data_filled.csv')
geodata = gpd.read_file('countries.geojson')
images = pd.read_csv('Country_Flags.csv')


flags.Name = flags.Name.str.replace('-',' ')
geodata = geodata[geodata.ISO_A3 != '-99']

# update old country names, typos, shorthands
# to maximize intersection of three datasets
flags = flags.replace(
	{'Name': {
		'Antigua Barbuda': 'Antigua and Barbuda',
		'Bahamas': 'The Bahamas',
		'British Virgin Isles': 'British Virgin Islands',
		'Burkina': 'Burkina Faso',
		'Cape Verde Islands': 'Cape Verde',
		'Comorro Islands': 'Comoros',
		'Czechoslovakia': 'Czech Republic',
		'Germany FRG': 'Germany',
		'Maldive Islands': 'Maldives',
		'North Yemen': 'Yemen',
		'Parguay': 'Paraguay',
		'Sao Tome': 'Sao Tome and Principe',
		'Soloman Islands': 'Solomon Islands',
		'St Helena': 'Saint Helena',
		'St Kitts Nevis': 'Saint Kitts and Nevis',
		'St Lucia': 'Saint Lucia',
		'St Vincent': 'Saint Vincent and the Grenadines',
		'Surinam': 'Suriname',
		'Trinidad Tobago': 'Trinidad and Tobago',
		'UAE': 'United Arab Emirates',
		'UK': 'United Kingdom',
		'US Virgin Isles': 'United States Virgin Islands',
		'USA': 'United States',
		'Western Samoa': 'Samoa',
		'Falklands-Malvinas': 'Falkland Islands',
		}
	}
)

images = images.replace(
	{'Country': {
		'Bahamas': 'The Bahamas',
		'Democratic Republic of Congo': 'Democratic Republic of the Congo',
		'Federated States of Micronesia': 'Micronesia',
		'Republic of China': 'Taiwan',
		'Saint Vincent and Grenadines': 'Saint Vincent and the Grenadines',
		'Sahrawi Arab Democratic Republic':'Western Sahara',
		'The Gambia': 'Gambia',
		}
	}
)

geodata = geodata.replace(
	{'ADMIN': {
		'Federated States of Micronesia': 'Micronesia',
		'Guinea Bissau': 'Guinea-Bissau',
		'Hong Kong S.A.R.': 'Hong Kong',
		'Republic of Serbia': 'Serbia',
		'United Republic of Tanzania': 'Tanzania',
		'United States of America': 'United States',
		'Vatican': 'Vatican City',
		'Puerto Rico': 'Puerto-Rico',
		}
	}
)


# add data for countries founded after 1990

fgi = flags.merge(geodata, how='outer', left_on='Name', right_on='ADMIN')
fgi = fgi.merge(images, how='outer', left_on='ADMIN', right_on='Country')
gi = geodata.merge(images, how='outer', left_on='ADMIN', right_on='Country')
gi = gi[~gi.ADMIN.isin(fgi.ADMIN)]
temp = pd.concat([fgi, gi], sort=False)
# ignore zone, area, population, language, religion columns.
# fill missing country names
temp = temp.fillna(value={'Zone':0, 'Area':0, 'Population':0, 'Language':0, 'Religion':8, 'Name':temp.Country})
#temp.to_csv('data_to_fill.csv')

# data_to_fill.csv is uploaded to google drive,
# where missing values are filled in manually

# TODO merge with the rest of the data


# save file
gdf = gpd.GeoDataFrame(fgi, geometry=list(fgi['geometry']))
gdf.to_file('merged_countries_union.geojson', driver='GeoJSON')


# fg = flags.merge(geodata, how='inner', left_on='Name', right_on='ADMIN')
# fg = fg[~fg.Name.isin(fgi.Name)]
# gi = geodata.merge(images, how='inner', left_on='ADMIN', right_on='Country')
# gi = gi[~gi.ADMIN.isin(fgi.ADMIN)]
# fi = flags.merge(images, how='inner', left_on='Name', right_on='Country')
# fi = fi[~fi.Name.isin(fgi.Name)]
# f = flags[~flags.Name.isin(geodata.ADMIN) & ~flags.Name.isin(images.Country)]
# g = geodata[~geodata.ADMIN.isin(flags.Name) & ~geodata.ADMIN.isin(images.Country)]
# i = images[~images.Country.isin(flags.Name) & ~images.Country.isin(geodata.ADMIN)]

# 163 countries in all three datasets so far
