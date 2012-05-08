desc "Recompiles all scss"
task :scss do
  system "set -x && rm -rf css/* && compass compile"
end

desc "Recompiles all coffeescript"
task :coffee do
  system "set -x && rm -rf js/* && coffee -c -o js coffeescripts"
end

desc "Compiles both scss and coffeescript"
task :compile => [:scss, :coffee]

task :default => :compile
