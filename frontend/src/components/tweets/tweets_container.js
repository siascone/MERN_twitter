import { connect } from 'react-redux';
import { fetchTweets } from '../../actions/tweet_actions';
import Tweets from './tweets';

const mapSTP = (state) => {
    return {
        tweets: Object.values(state.tweets.all)
    };
};

const mapDTP = dispatch => {
    return {
        fetchTweets: () => dispatch(fetchTweets())
    };
};

export default connect(mapSTP, mapDTP)(Tweets)