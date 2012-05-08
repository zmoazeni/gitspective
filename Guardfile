# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'coffeescript', :input => 'coffee', :output => 'js'

guard 'compass', :configuration_file => "compass.rb" do
  watch(/^sass\/(.*)\.s[ac]ss/)
end
