#   Manipulate the chef run by copying this file to a location of your choosing
#   and setting the environment variable PELIAS_VAGRANTFILE=/path/to/your/file.
#   This default config will be loaded if you don't set this value.
#
#   Note that on subsequent provisioning runs, the behavior will be as follows:
#   No action will be taken to re-index data if the index exists and all the specified
#   data files exist.
#   If a request is made to index data that does not exist, the system will attempt to load
#   it into the existing index.
#
#   If you want to rebuild the index from scratch, simply destroy the index:
#   curl -XDELETE localhost:9200/pelias
#   Or, add a drop_index => true key and re-run the provisioner to accomplish the same thing.
#   This will have the additional effect of wiping all the existing data, forcing it to
#   be downloaded again.

Vagrant.configure('2') do |config|
  config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = 'cookbooks'

    chef.json = {
      'pelias' => {
        'schema' => {
          'create_index' => true
        },
        'geonames' => {
          'index_data' => true,
          'alpha2_country_codes' => [
            'GB',
            'US'
          ]
        },
        'quattroshapes' => {
          'index_data' => true,
          'alpha3_country_codes' => [
            'GBR',
            'USA'
          ]
        },
        'openaddresses' => {
          'index_data' => true,
          'data_files' => [
            'us-ny-nyc.csv',
            'us-ca-san_francisco.csv'
          ]
        },
        'osm' => {
          'index_data' => true,
          'extracts' => {
            'london' => 'https://s3.amazonaws.com/metro-extracts.mapzen.com/london_england.osm.pbf'
            'nyc' => 'https://s3.amazonaws.com/metro-extracts.mapzen.com/new-york_new-york.osm.pbf'
          }
        }
      }
    }

    chef.run_list = [
      'recipe[pelias::default]'
    ]
  end
end