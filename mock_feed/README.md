# Mock Feed

This is a script to generate RSS / Atom XMLs with dynamical content to
test whether the whole system (**ReadKeyRSS** + **ReadKeyServer**) could get updated.

It uses [python-feedgen](https://github.com/lkiesow/python-feedgen) for 
feed generation, and requires a simple server to serve the actual XML file. The
generated XML files are located in `mock_feed/dist` so make sure the directory exists.

The typical usage would be as follows:

~~~~~bash
cd mock_feed/dist && python -m SimpleHTTPServer 8888
cd ..
python mockfeed_gen.py atom
# Or
# python mockfeed_gen.py rss
~~~~~

Then during development, `http://localhost:8888/dist/mock.feed.atom` 
(or `http://localhost:8888/dist/mock.rss.atom`, depending on which type is specified
in the command line arguments) could be used as a feed source to subscribe in the web
client.
