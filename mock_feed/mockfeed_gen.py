import argparse
import time

# Credits to:
# https://github.com/lkiesow/python-feedgen
from feedgen.feed import FeedGenerator

ATOM_FILE = './dist/mock.feed.atom'
RSS_FILE = './dist/mock.rss.xml'

FEED_ID = 'localhost:8888/edfward'
FEED_TYPE_RSS = 'rss'
FEED_TYPE_ATOM = 'atom'


def create_mock_fg():
    fg = FeedGenerator()
    fg.id(FEED_ID)
    fg.title('Some Test Feed')
    fg.author({'name': 'Edfward', 'email': 'edfward@example.com'})
    fg.subtitle('Test feed subtitle!')
    fg.link(href=FEED_ID, rel='self')
    fg.language('en')
    return fg


class FeedBuilder:

    # Upper limit of num of feeds to keep.
    FEED_SIZE = 15

    def __init__(self, feed_type):
        self.fg = create_mock_fg()
        self.feed_type = feed_type
        self.cnt = 0

    def update(self):
        fe = self.fg.add_entry()
        self.cnt += 1

        # Remove earlier entries if any.
        if len(self.fg.entry()) > FeedBuilder.FEED_SIZE:
            self.fg.remove_entry(0)

        fe.id('{}/{}'.format(FEED_ID, self.cnt))
        fe.title('Title {}'.format(self.cnt))
        fe.content('<p>Content {}</p>'.format(self.cnt))

        if self.feed_type == FEED_TYPE_RSS:
            self.fg.rss_file(RSS_FILE)
        elif self.feed_type == FEED_TYPE_ATOM:
            self.fg.atom_file(ATOM_FILE)
        return fe


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'feed_type', choices=['rss', 'atom'],
        help='a string indicating the type of feeds: "rss" or "atom"')

    args = parser.parse_args()

    fb = FeedBuilder(args.feed_type)
    while True:
        time.sleep(30)
        item = fb.update()
        print('add entry "{}"'.format(item.title()))
