'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    Dimensions,
    StyleSheet,
    View,
    ScrollView,
    Animated,
    } = ReactNative;
/**
 * BlurView temporarily removed until semver stuff is set up properly
 */
//var BlurView /* = require('react-native-blur').BlurView */;
var ScrollableMixin = require('react-native-scrollable-mixin');
var screen = Dimensions.get('window');
var ScrollViewPropTypes = ScrollView.propTypes;

var ParallaxView = React.createClass({
    mixins: [ScrollableMixin],

    propTypes: {
        ...ScrollViewPropTypes,
        windowHeight: React.PropTypes.number,
        background: React.PropTypes.node,
        backgroundSource: React.PropTypes.oneOfType([
          React.PropTypes.shape({
            uri: React.PropTypes.string,
          }),
          // Opaque type returned by require('./image.jpg')
          React.PropTypes.number,
        ]),
        header: React.PropTypes.node,
        blur: React.PropTypes.string,
        contentInset: React.PropTypes.object,
    },

    getDefaultProps: function () {
        return {
            windowHeight: 300,
            contentInset: {
                top: screen.scale
            }
        };
    },

    getInitialState: function () {
        const scrollY = new Animated.Value(0);
        return {
            scrollY,
            onScroll: Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY }}}],
              { useNativeDriver: true }
            ),
        };
    },

    /**
     * IMPORTANT: You must return the scroll responder of the underlying
     * scrollable component from getScrollResponder() when using ScrollableMixin.
     */
    getScrollResponder() {
      return this._scrollView.getScrollResponder();
    },

    setNativeProps(props) {
      this._scrollView.setNativeProps(props);
    },

    renderBackground: function () {
        var { windowHeight, backgroundSource, backgroundSourceColor = 'white', backgroundView = null, blur } = this.props;
        var { scrollY } = this.state;
        if (!windowHeight || (!backgroundSource && !backgroundView)) {
            return null;
        }

        if(backgroundView !== null) {
          return (
              <Animated.View
                style={[styles.backgroundView, { backgroundColor: backgroundSourceColor }, {
                    height: windowHeight,
                    transform: [{
                        translateY: scrollY.interpolate({
                            inputRange: [ -windowHeight, 0, windowHeight],
                            outputRange: [windowHeight/2, 0, -windowHeight/3]
                        })
                    },{
                        scale: scrollY.interpolate({
                            inputRange: [ -windowHeight, 0, windowHeight],
                            outputRange: [2, 1, 1]
                        })
                    }]
                }]}>
                  {backgroundView}
              </Animated.View>
          );
        }

        return (
            <Animated.Image
                style={[styles.background, { backgroundColor: backgroundSourceColor }, {
                    height: windowHeight,
                    transform: [{
                        translateY: scrollY.interpolate({
                            inputRange: [ -windowHeight, 0, windowHeight],
                            outputRange: [windowHeight/2, 0, -windowHeight/3]
                        })
                    },{
                        scale: scrollY.interpolate({
                            inputRange: [ -windowHeight, 0, windowHeight],
                            outputRange: [2, 1, 1]
                        })
                    }]
                }]}
                source={backgroundSource}>
                {/*
                    !!blur && (BlurView || (BlurView = require('react-native-blur').BlurView)) &&
                    <BlurView blurType={blur} style={styles.blur} />
                */}
            </Animated.Image>
        );
    },

    renderHeader: function () {
        var { windowHeight, backgroundSource, backgroundView } = this.props;
        var { scrollY } = this.state;
        if (!windowHeight || (!backgroundSource && !backgroundView)) {
            return null;
        }
        return (
            <Animated.View style={{
                position: 'relative',
                height: windowHeight,
                opacity: scrollY.interpolate({
                    inputRange: [-windowHeight, 0, windowHeight / 1.2],
                    outputRange: [1, 1, 0]
                }),
            }}>
                {this.props.header}
            </Animated.View>
        );
    },

    render: function () {
        var { style } = this.props;
        var onScroll = this.props.onScroll ? e => {
            this.props.onScroll(e);
            this.state.onScroll(e);
        } : this.state.onScroll;
        return (
            <View style={[styles.container, style]}>
                {this.renderBackground()}
                <Animated.ScrollView
                    ref={component => { this._scrollView = component; }}
                    {...this.props}
                    style={styles.scrollView}
                    onScroll={onScroll}
                    scrollEventThrottle={1}>
                    {this.renderHeader()}
                    <View style={[styles.content, this.props.scrollableViewStyle]}>
                        {this.props.children}
                    </View>
                </Animated.ScrollView>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: 'transparent',
    },
    scrollView: {
        backgroundColor: 'transparent',
    },
    background: {
        position: 'absolute',
        backgroundColor: '#2e2f31',
        width: screen.width,
        resizeMode: 'cover'
    },
    backgroundView: {
        position: 'absolute',
        backgroundColor: '#2e2f31',
        width: screen.width
    },
    blur: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    content: {
        shadowColor: '#222',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'column'
    }
});

module.exports = ParallaxView;
