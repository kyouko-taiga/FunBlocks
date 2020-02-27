import React from 'react'

interface Observable {
  subscribe(observer: ((subject: this) => void)): void
  unsubscribe(observer: ((subject: this) => void)): void
}

type RCT<Props> = React.ComponentType<Props>

export const subscribe = <Subject extends Observable, ObservedProps extends object>(
  subject: Subject,
  observe: ((subject: Subject) => ObservedProps)
) => {
  return <Props>(Component: RCT<Props & ObservedProps>): RCT<Omit<Props, keyof ObservedProps>> => {
    return class Subscribed extends React.Component<Props> {

      static displayName = 'Subscribed' + Component.displayName

      private observer: () => void

      public constructor(props: Props) {
        super(props)
        this.observer = () => this.forceUpdate()
      }

      public componentDidMount() {
        subject.subscribe(this.observer)
      }

      public componentWIllUnmount() {
        subject.unsubscribe(this.observer)
      }

      public render() {
        return React.createElement(Component, { ...this.props, ...observe(subject) }, null)
      }

    }
  }
}
