import { render } from '@testing-library/react-native';
import { colors } from '../../constants/colors';
import OnboardingBar from '../../components/OnboardingBar';

// Count how many segments are filled by inspecting the rendered tree.
// Segments are plain Views; filled ones carry the ochre backgroundColor.
function countFilled(tree) {
  const flatten = (node, acc = []) => {
    if (!node) return acc;
    if (Array.isArray(node)) {
      node.forEach((n) => flatten(n, acc));
      return acc;
    }
    acc.push(node);
    const children = node.children ?? [];
    (Array.isArray(children) ? children : [children]).forEach((c) => flatten(c, acc));
    return acc;
  };
  const nodes = flatten(tree);
  return nodes.filter((n) => {
    const style = Array.isArray(n.props?.style) ? n.props.style : [n.props?.style];
    return style.some((s) => s && s.backgroundColor === colors.ochre.base);
  }).length;
}

describe('OnboardingBar', () => {
  it('fills step segments and leaves the rest empty', () => {
    const { toJSON } = render(<OnboardingBar step={2} total={5} />);
    expect(countFilled(toJSON())).toBe(2);
  });

  it('renders zero filled segments at step 0', () => {
    const { toJSON } = render(<OnboardingBar step={0} total={5} />);
    expect(countFilled(toJSON())).toBe(0);
  });

  it('fills every segment when step equals total', () => {
    const { toJSON } = render(<OnboardingBar step={5} total={5} />);
    expect(countFilled(toJSON())).toBe(5);
  });

  it('defaults total to 5 segments', () => {
    const { toJSON } = render(<OnboardingBar step={1} />);
    // 1 filled + 4 empty = 5 visible segment views. The root has 5 direct children.
    const root = toJSON();
    expect(root.children.length).toBe(5);
  });
});
